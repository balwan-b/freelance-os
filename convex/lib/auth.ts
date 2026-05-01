import type { QueryCtx, MutationCtx } from "../_generated/server";

async function getUserByToken(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
) {
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .unique();
}

export async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await getUserByToken(ctx, identity.tokenIdentifier);
  if (!user) {
    throw new Error("User profile not initialized");
  }

  return { identity, user };
}

export function displayNameFromIdentity(identity: {
  name?: string | null;
  email?: string | null;
  tokenIdentifier: string;
}) {
  if (identity.name) {
    return identity.name;
  }
  if (identity.email) {
    return identity.email.split("@")[0];
  }
  return identity.tokenIdentifier;
}

export function currentMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
