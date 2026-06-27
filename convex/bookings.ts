import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";
import { recordActivity } from "./lib/activity";
import {
  decrementUsageIfCurrentMonth,
  enforcePlanLimit,
  incrementUsage,
} from "./lib/billing";
import {
  assertBookingAvailability,
  getAvailableSlotsForDate,
  getDefaultEndTime,
  getAvailabilityRules,
} from "./lib/scheduling";
import { getInitials } from "./lib/utils";

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
  return getDefaultEndTime(startTime);
}

const MAX_LIST_BOOKINGS = 200;
const MAX_CALENDAR_BOOKINGS = 366;

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
        .take(MAX_LIST_BOOKINGS);
    } else if (args.status) {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_userId_and_status", (q) =>
          q.eq("userId", user._id).eq("status", args.status!),
        )
        .take(MAX_LIST_BOOKINGS);
    } else if (args.date) {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_userId_and_date", (q) =>
          q.eq("userId", user._id).eq("date", args.date!),
        )
        .take(MAX_LIST_BOOKINGS);
    } else {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_userId_and_date", (q) => q.eq("userId", user._id))
        .take(MAX_LIST_BOOKINGS);
    }

    return rows.sort((a, b) => {
      const left = a.startsAtUtc ?? new Date(`${a.date}T${a.startTime}:00`).getTime();
      const right = b.startsAtUtc ?? new Date(`${b.date}T${b.startTime}:00`).getTime();
      return left - right;
    });
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
      .take(MAX_CALENDAR_BOOKINGS);
    return rows.sort((a, b) => {
      const left = a.startsAtUtc ?? new Date(`${a.date}T${a.startTime}:00`).getTime();
      const right = b.startsAtUtc ?? new Date(`${b.date}T${b.startTime}:00`).getTime();
      return left - right;
    });
  },
});

export const availability = query({
  args: {
    from: v.string(),
    to: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const rules = await getAvailabilityRules(ctx, user._id);
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).gte("date", args.from).lte("date", args.to),
      )
      .take(MAX_CALENDAR_BOOKINGS);

    const slotsByDate: Record<string, string[]> = {};
    let cursor = args.from;
    while (cursor <= args.to) {
      slotsByDate[cursor] = getAvailableSlotsForDate(cursor, rules, bookings, user.timezone);
      const next = new Date(`${cursor}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      cursor = next.toISOString().slice(0, 10);
    }

    return {
      timezone: user.timezone,
      rules,
      slotsByDate,
    };
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
    const availability = await assertBookingAvailability(ctx, user, {
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
    });

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
          await enforcePlanLimit(ctx, user._id, "clientCount");
          clientId = await ctx.db.insert("clients", {
            userId: user._id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            location: undefined,
            status: "active",
            tags: inquiry.tags,
            initials: getInitials(inquiry.name),
            sourceInquiryId: inquiry._id,
            joinedOn: args.date,
            lastInteractionDate: args.date,
          });
          await ctx.db.patch(inquiry._id, {
            clientId,
            convertedClientId: clientId,
            stage: "qualified",
          });
          await incrementUsage(ctx, user._id, "clientCount");
          clientName = inquiry.name;
        }
      } else if (clientName) {
        await enforcePlanLimit(ctx, user._id, "clientCount");
        clientId = await ctx.db.insert("clients", {
          userId: user._id,
          name: clientName,
          email: undefined,
          phone: undefined,
          location: undefined,
          status: "active",
          tags: [],
          initials: getInitials(clientName),
          sourceInquiryId: undefined,
          joinedOn: args.date,
          lastInteractionDate: args.date,
        });
        await incrementUsage(ctx, user._id, "clientCount");
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
      endTime: availability.endTime ?? endTimeFrom(args.startTime),
      status: "upcoming",
      type: args.type,
      amountCents: args.amountCents,
      notes: args.notes,
      bookingTimezone: availability.bookingTimeZone,
      startsAtUtc: availability.startsAtUtc,
      endsAtUtc: availability.endsAtUtc,
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

    // Automated Workflow: Create prep task for the booking
    await ctx.db.insert("tasks", {
      userId: user._id,
      clientId,
      title: `Prep for ${args.type} booking with ${clientName}`,
      completed: false,
      dueDate: args.date,
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
    if (args.status === "cancelled") {
      await recordActivity(ctx, {
        userId: user._id,
        type: "booking",
        title: "Booking cancelled",
        description: `${booking.clientName} booking was cancelled.`,
      });
    }
  },
});

export const update = mutation({
  args: {
    bookingId: v.id("bookings"),
    clientId: v.optional(v.id("clients")),
    clientName: v.optional(v.string()),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    type: v.optional(bookingTypeValidator),
    amountCents: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(bookingStatusValidator),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    let resolvedClientId = booking.clientId;
    let resolvedClientName = booking.clientName;

    if (args.clientId !== undefined) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.userId !== user._id) {
        throw new Error("Client not found");
      }
      resolvedClientId = client._id;
      resolvedClientName = client.name;
    } else if (booking.clientId) {
      const existingClient = await ctx.db.get(booking.clientId);
      if (existingClient?.userId === user._id) {
        resolvedClientName = existingClient.name;
      }
    } else if (args.clientName !== undefined) {
      resolvedClientName = args.clientName;
    }

    const nextDate = args.date ?? booking.date;
    const nextStartTime = args.startTime ?? booking.startTime;
    const nextEndTime = args.endTime ?? booking.endTime;

    const availability = await assertBookingAvailability(
      ctx,
      user,
      {
        date: nextDate,
        startTime: nextStartTime,
        endTime: nextEndTime,
      },
      booking._id,
    );

    const patch: {
      clientId?: typeof booking.clientId;
      clientName?: string;
      title?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      type?: "call" | "session" | "project";
      amountCents?: number;
      notes?: string;
      status?: "upcoming" | "completed" | "cancelled";
      bookingTimezone?: string;
      startsAtUtc?: number;
      endsAtUtc?: number;
    } = {};
    if (args.clientId !== undefined) patch.clientId = resolvedClientId;
    if (args.clientId !== undefined || args.clientName !== undefined) {
      patch.clientName = resolvedClientName;
    }
    if (args.title !== undefined) patch.title = args.title;
    if (args.date !== undefined) patch.date = nextDate;
    if (args.startTime !== undefined) patch.startTime = nextStartTime;
    if (args.endTime !== undefined) patch.endTime = availability.endTime;
    if (args.type !== undefined) patch.type = args.type;
    if (args.amountCents !== undefined) patch.amountCents = args.amountCents;
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.status !== undefined) patch.status = args.status;
    patch.bookingTimezone = availability.bookingTimeZone;
    patch.startsAtUtc = availability.startsAtUtc;
    patch.endsAtUtc = availability.endsAtUtc;

    await ctx.db.patch(args.bookingId, patch);
  },
});

export const remove = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.bookingId);
    await decrementUsageIfCurrentMonth(
      ctx,
      user._id,
      "bookingCount",
      booking._creationTime,
    );

    await recordActivity(ctx, {
      userId: user._id,
      type: "booking",
      title: "Booking removed",
      description: `A booking with ${booking.clientName} was removed.`,
    });
  },
});
