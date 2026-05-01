import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";
import { recordActivity } from "./lib/activity";

const inquiryStageValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("rejected"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentUser(ctx);
    const stages = ["new", "contacted", "qualified", "rejected"] as const;
    const response: Record<(typeof stages)[number], unknown[]> = {
      new: [],
      contacted: [],
      qualified: [],
      rejected: [],
    };

    for (const stage of stages) {
      const rows = await ctx.db
        .query("inquiries")
        .withIndex("by_userId_and_stage", (q) =>
          q.eq("userId", user._id).eq("stage", stage),
        )
        .collect();
      response[stage] = rows
        .filter((row) => !row.convertedClientId)
        .sort((a, b) => b.receivedOn.localeCompare(a.receivedOn));
    }

    return response;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    service: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    budget: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiryId = await ctx.db.insert("inquiries", {
      userId: user._id,
      name: args.name,
      service: args.service,
      email: args.email,
      phone: args.phone,
      budget: args.budget,
      tags: args.tags ?? [],
      notes: args.notes,
      stage: "new",
      receivedOn: new Date().toISOString(),
      clientId: undefined,
      convertedClientId: undefined,
    });

    await recordActivity(ctx, {
      userId: user._id,
      type: "message",
      title: "New inquiry captured",
      description: `${args.name} requested ${args.service}.`,
    });

    return inquiryId;
  },
});

export const updateStage = mutation({
  args: {
    inquiryId: v.id("inquiries"),
    stage: inquiryStageValidator,
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.inquiryId, {
      stage: args.stage,
    });
  },
});

export const addNote = mutation({
  args: {
    inquiryId: v.id("inquiries"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.insert("notes", {
      userId: user._id,
      inquiryId: inquiry._id,
      content: args.content,
      authorName: user.name,
      createdOn: new Date().toISOString(),
    });
  },
});

export const convertToClient = mutation({
  args: {
    inquiryId: v.id("inquiries"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry || inquiry.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    if (inquiry.convertedClientId) {
      return inquiry.convertedClientId;
    }

    const initials = inquiry.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("");

    const clientId = await ctx.db.insert("clients", {
      userId: user._id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      location: undefined,
      status: "active",
      tags: inquiry.tags,
      initials,
      sourceInquiryId: inquiry._id,
      joinedOn: new Date().toISOString().slice(0, 10),
      lastInteractionDate: new Date().toISOString().slice(0, 10),
    });

    await ctx.db.patch(inquiry._id, {
      clientId,
      convertedClientId: clientId,
      stage: "qualified",
    });

    await recordActivity(ctx, {
      userId: user._id,
      type: "client",
      title: "Inquiry converted",
      description: `${inquiry.name} was converted into a client.`,
    });

    return clientId;
  },
});
