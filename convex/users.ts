import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { displayNameFromIdentity } from "./lib/auth";

const DEFAULT_NOTIFICATIONS = {
  emailBookings: true,
  pushBookings: true,
  smsBookings: false,
  newMessages: true,
  projectReminders: true,
};

const DEFAULT_AVAILABILITY = [
  { dayOfWeek: 1, enabled: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 2, enabled: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 3, enabled: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 4, enabled: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 5, enabled: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 6, enabled: false, startTime: "10:00", endTime: "14:00" },
  { dayOfWeek: 0, enabled: false, startTime: "10:00", endTime: "14:00" },
];

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    const name = displayNameFromIdentity(identity);
    const email = identity.email ?? undefined;
    const imageUrl =
      typeof identity.pictureUrl === "string" ? identity.pictureUrl : undefined;
    const clerkUserId = identity.subject;

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        email,
        imageUrl,
        clerkUserId,
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId,
      email,
      name,
      imageUrl,
      onboardingCompleted: false,
      timezone: "Asia/Calcutta",
    });

    await ctx.db.insert("userSettings", {
      userId,
      bio: undefined,
      location: undefined,
      phone: undefined,
      notifications: DEFAULT_NOTIFICATIONS,
    });

    for (const rule of DEFAULT_AVAILABILITY) {
      await ctx.db.insert("availabilityRules", {
        userId,
        ...rule,
      });
    }

    await ctx.db.insert("subscriptions", {
      userId,
      plan: "free",
      status: "active",
      cancelAtPeriodEnd: false,
    });

    return userId;
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return null;
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId_and_read", (q) => q.eq("userId", user._id).eq("read", false))
      .take(5);

    return {
      ...user,
      settings,
      subscription,
      unreadNotifications,
    };
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) {
      throw new Error("User profile not initialized");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});
