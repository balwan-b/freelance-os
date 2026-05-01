import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentUser(ctx);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_dueDate", (q) => q.eq("userId", user._id))
      .collect();
    return tasks.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    dueDate: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
    inquiryId: v.optional(v.id("inquiries")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    return await ctx.db.insert("tasks", {
      userId: user._id,
      clientId: args.clientId,
      inquiryId: args.inquiryId,
      title: args.title,
      completed: false,
      dueDate: args.dueDate,
    });
  },
});

export const toggle = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.taskId, {
      completed: !task.completed,
    });
  },
});
