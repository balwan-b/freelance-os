import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function recordActivity(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: "booking" | "client" | "message" | "completion";
    title: string;
    description: string;
  },
) {
  const createdOn = new Date().toISOString();
  await ctx.db.insert("activityEvents", {
    userId: args.userId,
    type: args.type,
    title: args.title,
    description: args.description,
    occurredOn: createdOn,
  });
  await ctx.db.insert("notifications", {
    userId: args.userId,
    title: args.title,
    description: args.description,
    read: false,
    createdOn,
  });
}
