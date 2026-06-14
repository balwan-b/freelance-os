import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";
import { recordActivity } from "./lib/activity";
import { enforcePlanLimit, incrementUsage } from "./lib/billing";
import { getInitials } from "./lib/utils";

const inquiryStageValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("rejected"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentUser(ctx);
    const stages = ["new", "contacted", "qualified", "rejected"] as const;

    // Run all 4 stage queries in parallel instead of serial
    const results = await Promise.all(
      stages.map((stage) =>
        ctx.db
          .query("inquiries")
          .withIndex("by_userId_and_stage", (q) =>
            q.eq("userId", user._id).eq("stage", stage),
          )
          .take(50),
      ),
    );

    const response: Record<(typeof stages)[number], unknown[]> = {
      new: [],
      contacted: [],
      qualified: [],
      rejected: [],
    };

    stages.forEach((stage, i) => {
      response[stage] = results[i]
        .filter((row) => !row.convertedClientId)
        .sort((a, b) => b.receivedOn.localeCompare(a.receivedOn));
    });

    return response;
  },
});


export const create = mutation({
  args: {
    name: v.string(),
    service: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    budget: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiryId = await ctx.db.insert("inquiries", {
      userId: user._id,
      name: args.name,
      service: args.service,
      email: args.email,
      phone: args.phone,
      budget: args.budget,
      tags: args.tags ?? [],
      notes: args.notes,
      stage: "new",
      receivedOn: new Date().toISOString(),
      clientId: undefined,
      convertedClientId: undefined,
    });

    await recordActivity(ctx, {
      userId: user._id,
      type: "message",
      title: "New inquiry captured",
      description: `${args.name} requested ${args.service}.`,
    });

    return inquiryId;
  },
});

export const update = mutation({
  args: {
    inquiryId: v.id("inquiries"),
    name: v.optional(v.string()),
    service: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    budget: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const patch: {
      name?: string;
      service?: string;
      email?: string;
      phone?: string;
      budget?: string;
      tags?: string[];
      notes?: string;
    } = {};

    if (args.name !== undefined) patch.name = args.name;
    if (args.service !== undefined) patch.service = args.service;
    if (args.email !== undefined) patch.email = args.email;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.budget !== undefined) patch.budget = args.budget;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.notes !== undefined) patch.notes = args.notes;

    await ctx.db.patch(args.inquiryId, patch);
  },
});

export const updateStage = mutation({
  args: {
    inquiryId: v.id("inquiries"),
    stage: inquiryStageValidator,
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.inquiryId, {
      stage: args.stage,
    });
  },
});

export const addNote = mutation({
  args: {
    inquiryId: v.id("inquiries"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.insert("notes", {
      userId: user._id,
      inquiryId: inquiry._id,
      content: args.content,
      authorName: user.name,
      createdOn: new Date().toISOString(),
    });
  },
});

export const convertToClient = mutation({
  args: {
    inquiryId: v.id("inquiries"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    if (inquiry.convertedClientId) {
      return inquiry.convertedClientId;
    }

    await enforcePlanLimit(ctx, user._id, "clientCount");

    const clientId = await ctx.db.insert("clients", {
      userId: user._id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      location: undefined,
      status: "active",
      tags: inquiry.tags,
      initials: getInitials(inquiry.name),
      sourceInquiryId: inquiry._id,
      joinedOn: new Date().toISOString().slice(0, 10),
      lastInteractionDate: new Date().toISOString().slice(0, 10),
    });

    await ctx.db.patch(inquiry._id, {
      clientId,
      convertedClientId: clientId,
      stage: "qualified",
    });

    await recordActivity(ctx, {
      userId: user._id,
      type: "client",
      title: "Inquiry converted",
      description: `${inquiry.name} was converted into a client.`,
    });
    await incrementUsage(ctx, user._id, "clientCount");

    return clientId;
  },
});

export const remove = mutation({
  args: {
    inquiryId: v.id("inquiries"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    for await (const note of ctx.db
      .query("notes")
      .withIndex("by_inquiryId_and_createdOn", (q) => q.eq("inquiryId", inquiry._id))) {
      await ctx.db.delete(note._id);
    }

    if (inquiry.convertedClientId) {
      const client = await ctx.db.get(inquiry.convertedClientId);
      if (client?.sourceInquiryId === inquiry._id) {
        await ctx.db.patch(client._id, {
          sourceInquiryId: undefined,
        });
      }
    }

    for await (const booking of ctx.db
      .query("bookings")
      .withIndex("by_inquiryId", (q) => q.eq("inquiryId", inquiry._id))) {
      await ctx.db.patch(booking._id, {
        inquiryId: undefined,
      });
    }

    await ctx.db.delete(args.inquiryId);
  },
});

