import type { MutationCtx, QueryCtx } from "../_generated/server";
import { currentMonthKey } from "./auth";

export async function getSubscriptionForUser(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  return await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId as never))
    .unique();
}

export async function getUsageCounter(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  monthKey = currentMonthKey(),
) {
  return await ctx.db
    .query("usageCounters")
    .withIndex("by_userId_and_monthKey", (q) =>
      q.eq("userId", userId as never).eq("monthKey", monthKey),
    )
    .unique();
}

export async function ensureUsageCounter(ctx: MutationCtx, userId: string) {
  const monthKey = currentMonthKey();
  const counter = await getUsageCounter(ctx, userId, monthKey);
  if (counter) {
    return counter;
  }
  const counterId = await ctx.db.insert("usageCounters", {
    userId: userId as never,
    monthKey,
    clientCount: 0,
    bookingCount: 0,
  });
  return await ctx.db.get(counterId);
}

export async function incrementUsage(
  ctx: MutationCtx,
  userId: string,
  key: "clientCount" | "bookingCount",
) {
  const counter = await ensureUsageCounter(ctx, userId);
  await ctx.db.patch(counter!._id, {
    [key]: (counter?.[key] ?? 0) + 1,
  });
}

export async function enforcePlanLimit(
  ctx: MutationCtx,
  userId: string,
  key: "clientCount" | "bookingCount",
) {
  const subscription = await getSubscriptionForUser(ctx, userId);
  const counter = await ensureUsageCounter(ctx, userId);
  if (!subscription || subscription.plan === "free") {
    const limit = key === "clientCount" ? 25 : 100;
    if ((counter?.[key] ?? 0) >= limit) {
      throw new Error(
        key === "clientCount"
          ? "Free plan client limit reached"
          : "Free plan booking limit reached",
      );
    }
  }
}
