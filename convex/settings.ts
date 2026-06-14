import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";

const availabilityRuleValidator = v.object({
  dayOfWeek: v.number(),
  enabled: v.boolean(),
  startTime: v.string(),
  endTime: v.string(),
});

const notificationPrefsValidator = v.object({
  emailBookings: v.boolean(),
  pushBookings: v.boolean(),
  smsBookings: v.boolean(),
  newMessages: v.boolean(),
  projectReminders: v.boolean(),
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentUser(ctx);
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const availability = await ctx.db
      .query("availabilityRules")
      .withIndex("by_userId_and_dayOfWeek", (q) => q.eq("userId", user._id))
      .take(7);
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return {
      user,
      settings,
      availability: availability.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
      subscription,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      name: args.name,
      email: args.email,
      timezone: args.timezone,
      onboardingCompleted: true,
    });

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!settings) {
      throw new Error("User settings missing");
    }

    await ctx.db.patch(settings._id, {
      bio: args.bio,
      location: args.location,
      phone: args.phone,
    });
  },
});

export const updateAvailability = mutation({
  args: { rules: v.array(availabilityRuleValidator) },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);

    // Fetch all existing rules in parallel, then write in parallel
    const existingRules = await Promise.all(
      args.rules.map((rule) =>
        ctx.db
          .query("availabilityRules")
          .withIndex("by_userId_and_dayOfWeek", (q) =>
            q.eq("userId", user._id).eq("dayOfWeek", rule.dayOfWeek),
          )
          .unique(),
      ),
    );

    await Promise.all(
      args.rules.map((rule, i) => {
        const existing = existingRules[i];
        if (existing) {
          return ctx.db.patch(existing._id, rule);
        }
        return ctx.db.insert("availabilityRules", { userId: user._id, ...rule });
      }),
    );
  },
});

export const updateNotifications = mutation({
  args: { notifications: notificationPrefsValidator },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!settings) {
      throw new Error("User settings missing");
    }

    await ctx.db.patch(settings._id, {
      notifications: args.notifications,
    });
  },
});
