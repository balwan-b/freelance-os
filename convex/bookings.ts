import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";
import { recordActivity } from "./lib/activity";
import { enforcePlanLimit, incrementUsage } from "./lib/billing";

const bookingStatusValidator = v.union(
  v.literal("upcoming"),
  v.literal("completed"),
  v.literal("cancelled"),
);

const bookingTypeValidator = v.union(
  v.literal("call"),
  v.literal("session"),
  v.literal("project"),
);

function endTimeFrom(startTime: string) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, hours, minutes));
  date.setUTCMinutes(date.getUTCMinutes() + 60);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

export const list = query({
  args: {
    status: v.optional(bookingStatusValidator),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);

    let rows;
    if (args.status && args.date) {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_userId_and_status_and_date", (q) =>
          q.eq("userId", user._id).eq("status", args.status!).eq("date", args.date!),
        )
        .collect();
    } else if (args.status) {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_userId_and_status", (q) =>
          q.eq("userId", user._id).eq("status", args.status!),
        )
        .collect();
    } else if (args.date) {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_userId_and_date", (q) =>
          q.eq("userId", user._id).eq("date", args.date!),
        )
        .collect();
    } else {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_userId_and_date", (q) => q.eq("userId", user._id))
        .collect();
    }

    return rows.sort((a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
    );
  },
});

export const calendar = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const rows = await ctx.db
      .query("bookings")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).gte("date", args.from).lte("date", args.to),
      )
      .collect();
    return rows.sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  },
});

export const create = mutation({
  args: {
    clientId: v.optional(v.id("clients")),
    clientName: v.optional(v.string()),
    inquiryId: v.optional(v.id("inquiries")),
    title: v.optional(v.string()),
    date: v.string(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    type: bookingTypeValidator,
    amountCents: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    await enforcePlanLimit(ctx, user._id, "bookingCount");

    let clientId = args.clientId;
    let clientName = args.clientName;

    if (clientId) {
      const client = await ctx.db.get(clientId);
      if (!client || client.userId !== user._id) {
        throw new Error("Client not found");
      }
      clientName = client.name;
    }

    if (!clientId) {
      if (args.inquiryId) {
        const inquiry = await ctx.db.get(args.inquiryId);
        if (!inquiry || inquiry.userId !== user._id) {
          throw new Error("Inquiry not found");
        }
        if (inquiry.convertedClientId) {
          clientId = inquiry.convertedClientId;
          clientName = inquiry.name;
        } else {
          const initials = inquiry.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]!.toUpperCase())
            .join("");
          clientId = await ctx.db.insert("clients", {
            userId: user._id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            location: undefined,
            status: "active",
            tags: inquiry.tags,
            initials,
            sourceInquiryId: inquiry._id,
            joinedOn: args.date,
            lastInteractionDate: args.date,
          });
          await ctx.db.patch(inquiry._id, {
            clientId,
            convertedClientId: clientId,
            stage: "qualified",
          });
          clientName = inquiry.name;
        }
      } else if (clientName) {
        const initials = clientName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]!.toUpperCase())
          .join("");
        clientId = await ctx.db.insert("clients", {
          userId: user._id,
          name: clientName,
          email: undefined,
          phone: undefined,
          location: undefined,
          status: "active",
          tags: [],
          initials,
          sourceInquiryId: undefined,
          joinedOn: args.date,
          lastInteractionDate: args.date,
        });
      }
    }

    if (!clientId || !clientName) {
      throw new Error("A client is required for bookings");
    }

    const bookingId = await ctx.db.insert("bookings", {
      userId: user._id,
      clientId,
      inquiryId: args.inquiryId,
      title: args.title ?? `${args.type} booking`,
      clientName,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime ?? endTimeFrom(args.startTime),
      status: "upcoming",
      type: args.type,
      amountCents: args.amountCents,
      notes: args.notes,
    });

    await ctx.db.patch(clientId, {
      lastInteractionDate: args.date,
    });
    await incrementUsage(ctx, user._id, "bookingCount");
    await recordActivity(ctx, {
      userId: user._id,
      type: "booking",
      title: "New booking confirmed",
      description: `${clientName} was booked for ${args.date} at ${args.startTime}.`,
    });

    return bookingId;
  },
});

export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: bookingStatusValidator,
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
    if (args.status === "completed") {
      await recordActivity(ctx, {
        userId: user._id,
        type: "completion",
        title: "Booking completed",
        description: `${booking.clientName} booking was marked complete.`,
      });
    }
  },
});
