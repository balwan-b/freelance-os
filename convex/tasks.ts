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

export const toggle = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    const completed = !task.completed;
    const now = new Date().toISOString();

    await ctx.db.patch(args.taskId, {
      completed,
    });

    // Automated Workflow: Add a note if task is completed
    if (completed && task.clientId) {
      await ctx.db.insert("notes", {
        userId: user._id,
        clientId: task.clientId,
        authorName: "System",
        content: `Task completed: ${task.title}`,
        createdOn: now,
      });
      await recordActivity(ctx, {
        userId: user._id,
        type: "completion",
        title: "Task completed",
        description: task.title,
      });
      const client = await ctx.db.get(task.clientId);
      if (client) {
        await ctx.db.patch(client._id, {
          lastInteractionDate: now.slice(0, 10),
        });
      }
    }
  },
});
