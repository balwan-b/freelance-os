import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";
import { recordActivity } from "./lib/activity";
import {
  decrementUsageIfCurrentMonth,
  enforcePlanLimit,
  incrementUsage,
} from "./lib/billing";
import { getInitials } from "./lib/utils";

const clientStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("archived"),
);

export const list = query({
  args: {
    status: v.optional(clientStatusValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const rows = args.status
      ? await ctx.db
          .query("clients")
          .withIndex("by_userId_and_status", (q) =>
            q.eq("userId", user._id).eq("status", args.status!),
          )
          .take(200)
      : await ctx.db
          .query("clients")
          .withIndex("by_userId_and_name", (q) => q.eq("userId", user._id))
          .take(200);

    const search = args.search?.trim().toLowerCase();
    const filtered = rows.filter((client) => {
      if (!search) return true;
      return (
        client.name.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phone?.toLowerCase().includes(search)
      );
    });

    // Return clients with a denormalized booking count stored on the doc.
    // This avoids N+1 queries. The count is maintained by bookings.create.
    return filtered.map((client) => ({
      ...client,
      totalBookings: (client as typeof client & { totalBookings?: number }).totalBookings ?? 0,
    }));
  },
});

export const get = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userId !== user._id) {
      return null;
    }

    const [bookings, notes, tasks] = await Promise.all([
      ctx.db
        .query("bookings")
        .withIndex("by_clientId_and_date", (q) => q.eq("clientId", client._id))
        .take(100),
      ctx.db
        .query("notes")
        .withIndex("by_clientId_and_createdOn", (q) => q.eq("clientId", client._id))
        .take(100),
      ctx.db
        .query("tasks")
        .withIndex("by_clientId_and_dueDate", (q) => q.eq("clientId", client._id))
        .take(100),
    ]);

    return {
      client,
      bookings: bookings.sort((a, b) => b.date.localeCompare(a.date)),
      notes: notes
        .filter((n) => !(n as typeof n & { isSystem?: boolean }).isSystem)
        .sort((a, b) => b.createdOn.localeCompare(a.createdOn)),
      tasks: tasks.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(clientStatusValidator),
    tags: v.optional(v.array(v.string())),
    sourceInquiryId: v.optional(v.id("inquiries")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    await enforcePlanLimit(ctx, user._id, "clientCount");

    const joinedOn = new Date().toISOString().slice(0, 10);
    const clientId = await ctx.db.insert("clients", {
      userId: user._id,
      name: args.name,
      email: args.email,
      phone: args.phone,
      location: args.location,
      status: args.status ?? "active",
      tags: args.tags ?? [],
      initials: getInitials(args.name),
      sourceInquiryId: args.sourceInquiryId,
      joinedOn,
      lastInteractionDate: joinedOn,
    });

    await incrementUsage(ctx, user._id, "clientCount");
    await recordActivity(ctx, {
      userId: user._id,
      type: "client",
      title: "New client added",
      description: `${args.name} was added to your client list.`,
    });

    return clientId;
  },
});

export const updateStatus = mutation({
  args: {
    clientId: v.id("clients"),
    status: clientStatusValidator,
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.clientId, {
      status: args.status,
      lastInteractionDate: new Date().toISOString().slice(0, 10),
    });
  },
});

export const addNote = mutation({
  args: {
    clientId: v.id("clients"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const createdOn = new Date().toISOString();
    await ctx.db.insert("notes", {
      userId: user._id,
      clientId: client._id,
      content: args.content,
      authorName: user.name,
      createdOn,
    });
    await ctx.db.patch(client._id, {
      lastInteractionDate: createdOn.slice(0, 10),
    });
    await recordActivity(ctx, {
      userId: user._id,
      type: "message",
      title: "Client note added",
      description: `A new note was added for ${client.name}.`,
    });
  },
});

export const update = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(clientStatusValidator),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const patch: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      status?: "active" | "inactive" | "archived";
      tags?: string[];
      initials?: string;
      lastInteractionDate?: string;
    } = {
      lastInteractionDate: new Date().toISOString().slice(0, 10),
    };

    if (args.name !== undefined) {
      patch.name = args.name;
      patch.initials = getInitials(args.name);
    }
    if (args.email !== undefined) patch.email = args.email;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.location !== undefined) patch.location = args.location;
    if (args.status !== undefined) patch.status = args.status;
    if (args.tags !== undefined) patch.tags = args.tags;

    await ctx.db.patch(args.clientId, patch);
  },
});

export const remove = mutation({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    for await (const booking of ctx.db
      .query("bookings")
      .withIndex("by_clientId_and_date", (q) => q.eq("clientId", client._id))) {
      await ctx.db.delete(booking._id);
      await decrementUsageIfCurrentMonth(
        ctx,
        user._id,
        "bookingCount",
        booking._creationTime,
      );
    }

    for await (const task of ctx.db
      .query("tasks")
      .withIndex("by_clientId_and_dueDate", (q) => q.eq("clientId", client._id))) {
      await ctx.db.delete(task._id);
    }

    for await (const note of ctx.db
      .query("notes")
      .withIndex("by_clientId_and_createdOn", (q) => q.eq("clientId", client._id))) {
      await ctx.db.delete(note._id);
    }

    for await (const inquiry of ctx.db
      .query("inquiries")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))) {
      await ctx.db.patch(inquiry._id, {
        clientId: undefined,
      });
    }

    for await (const inquiry of ctx.db
      .query("inquiries")
      .withIndex("by_convertedClientId", (q) => q.eq("convertedClientId", client._id))) {
      await ctx.db.patch(inquiry._id, {
        convertedClientId: undefined,
      });
    }

    await ctx.db.delete(args.clientId);
    await decrementUsageIfCurrentMonth(
      ctx,
      user._id,
      "clientCount",
      client._creationTime,
    );

    await recordActivity(ctx, {
      userId: user._id,
      type: "client",
      title: "Client removed",
      description: `${client.name} was removed from your client list.`,
    });
  },
});
