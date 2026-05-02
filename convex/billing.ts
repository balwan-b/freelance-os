import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentMonthKey, requireCurrentUser } from "./lib/auth";

const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("trialing"),
  v.literal("past_due"),
  v.literal("cancelled"),
  v.literal("incomplete"),
);

const subscriptionPlanValidator = v.union(v.literal("free"), v.literal("pro"));

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentUser(ctx);
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const usage = await ctx.db
      .query("usageCounters")
      .withIndex("by_userId_and_monthKey", (q) =>
        q.eq("userId", user._id).eq("monthKey", currentMonthKey()),
      )
      .unique();

    return {
      subscription,
      usage: usage ?? null,
    };
  },
});

/**
 * INTERNAL ONLY — called exclusively from the Stripe webhook API route.
 * Never expose this as a public mutation; it sets subscription plans with no auth.
 */
export const syncFromWebhook = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    plan: subscriptionPlanValidator,
    status: subscriptionStatusValidator,
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.boolean(),
    paymentMethodBrand: v.optional(v.string()),
    paymentMethodLast4: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let user = null;
    if (args.clerkUserId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId!))
        .unique();
    }
    if (!user && args.stripeCustomerId) {
      const existingByCustomer = await ctx.db
        .query("subscriptions")
        .withIndex("by_stripeCustomerId", (q) =>
          q.eq("stripeCustomerId", args.stripeCustomerId!),
        )
        .unique();
      if (existingByCustomer) {
        user = await ctx.db.get(existingByCustomer.userId);
      }
    }
    if (!user) {
      throw new Error("Unable to resolve subscription owner");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const payload = {
      plan: args.plan,
      status: args.status,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      paymentMethodBrand: args.paymentMethodBrand,
      paymentMethodLast4: args.paymentMethodLast4,
    };

    if (subscription) {
      await ctx.db.patch(subscription._id, payload);
      return subscription._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId: user._id,
      ...payload,
    });
  },
});
