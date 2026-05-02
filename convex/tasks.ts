import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";
import { recordActivity } from "./lib/activity";

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

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const patch: {
      title?: string;
      dueDate?: string;
      completed?: boolean;
    } = {};

    if (args.title !== undefined) patch.title = args.title;
    if (args.dueDate !== undefined) patch.dueDate = args.dueDate;
    if (args.completed !== undefined) patch.completed = args.completed;

    await ctx.db.patch(args.taskId, patch);
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
    const completed = !task.completed;

    await ctx.db.patch(args.taskId, { completed });

    if (completed && task.clientId) {
      // Record activity (which also inserts a notification) and bump lastInteractionDate
      await Promise.all([
        recordActivity(ctx, {
          userId: user._id,
          type: "completion",
          title: "Task completed",
          description: task.title,
        }),
        ctx.db.get(task.clientId).then((client) => {
          if (client) {
            return ctx.db.patch(client._id, {
              lastInteractionDate: new Date().toISOString().slice(0, 10),
            });
          }
        }),
      ]);
    }
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.taskId);
  },
});


