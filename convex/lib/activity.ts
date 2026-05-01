import type { MutationCtx } from "../_generated/server";

export async function recordActivity(
  ctx: MutationCtx,
  args: {
    userId: string;
    type: "booking" | "client" | "message" | "completion";
    title: string;
    description: string;
  },
) {
  const createdOn = new Date().toISOString();
  await ctx.db.insert("activityEvents", {
    userId: args.userId as never,
    type: args.type,
    title: args.title,
    description: args.description,
    occurredOn: createdOn,
  });
  await ctx.db.insert("notifications", {
    userId: args.userId as never,
    title: args.title,
    description: args.description,
    read: false,
    createdOn,
  });
}
