import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const clientStatus = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("archived"),
);

const inquiryStage = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("rejected"),
);

const bookingStatus = v.union(
  v.literal("upcoming"),
  v.literal("completed"),
  v.literal("cancelled"),
);

const bookingType = v.union(
  v.literal("call"),
  v.literal("session"),
  v.literal("project"),
);

const subscriptionPlan = v.union(v.literal("free"), v.literal("pro"));

const subscriptionStatus = v.union(
  v.literal("active"),
  v.literal("trialing"),
  v.literal("past_due"),
  v.literal("cancelled"),
  v.literal("incomplete"),
);

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    timezone: v.string(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkUserId", ["clerkUserId"]),

  userSettings: defineTable({
    userId: v.id("users"),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    notifications: v.object({
      emailBookings: v.boolean(),
      pushBookings: v.boolean(),
      smsBookings: v.boolean(),
      newMessages: v.boolean(),
      projectReminders: v.boolean(),
    }),
  }).index("by_userId", ["userId"]),

  availabilityRules: defineTable({
    userId: v.id("users"),
    dayOfWeek: v.number(),
    enabled: v.boolean(),
    startTime: v.string(),
    endTime: v.string(),
  }).index("by_userId_and_dayOfWeek", ["userId", "dayOfWeek"]),

  clients: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    status: clientStatus,
    tags: v.array(v.string()),
    initials: v.string(),
    sourceInquiryId: v.optional(v.id("inquiries")),
    joinedOn: v.string(),
    lastInteractionDate: v.optional(v.string()),
  })
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_userId_and_name", ["userId", "name"]),

  inquiries: defineTable({
    userId: v.id("users"),
    name: v.string(),
    service: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    budget: v.optional(v.string()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    stage: inquiryStage,
    receivedOn: v.string(),
    clientId: v.optional(v.id("clients")),
    convertedClientId: v.optional(v.id("clients")),
  })
    .index("by_userId_and_stage", ["userId", "stage"])
    .index("by_userId_and_receivedOn", ["userId", "receivedOn"]),

  bookings: defineTable({
    userId: v.id("users"),
    clientId: v.id("clients"),
    inquiryId: v.optional(v.id("inquiries")),
    title: v.string(),
    clientName: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: bookingStatus,
    type: bookingType,
    amountCents: v.optional(v.number()),
    notes: v.optional(v.string()),
    bookingTimezone: v.optional(v.string()),
    startsAtUtc: v.optional(v.number()),
    endsAtUtc: v.optional(v.number()),
  })
    .index("by_userId_and_date", ["userId", "date"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_userId_and_status_and_date", ["userId", "status", "date"])
    .index("by_clientId_and_date", ["clientId", "date"]),

  tasks: defineTable({
    userId: v.id("users"),
    clientId: v.optional(v.id("clients")),
    inquiryId: v.optional(v.id("inquiries")),
    title: v.string(),
    completed: v.boolean(),
    dueDate: v.optional(v.string()),
  })
    .index("by_userId_and_dueDate", ["userId", "dueDate"])
    .index("by_userId_and_completed", ["userId", "completed"])
    .index("by_clientId_and_dueDate", ["clientId", "dueDate"]),

  notes: defineTable({
    userId: v.id("users"),
    clientId: v.optional(v.id("clients")),
    inquiryId: v.optional(v.id("inquiries")),
    content: v.string(),
    authorName: v.string(),
    createdOn: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_clientId_and_createdOn", ["clientId", "createdOn"])
    .index("by_inquiryId_and_createdOn", ["inquiryId", "createdOn"]),

  activityEvents: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("booking"),
      v.literal("client"),
      v.literal("message"),
      v.literal("completion"),
    ),
    title: v.string(),
    description: v.string(),
    occurredOn: v.string(),
  }).index("by_userId_and_occurredOn", ["userId", "occurredOn"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    read: v.boolean(),
    createdOn: v.string(),
  })
    .index("by_userId_and_read", ["userId", "read"])
    .index("by_userId_and_createdOn", ["userId", "createdOn"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    plan: subscriptionPlan,
    status: subscriptionStatus,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.boolean(),
    paymentMethodBrand: v.optional(v.string()),
    paymentMethodLast4: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  usageCounters: defineTable({
    userId: v.id("users"),
    monthKey: v.string(),
    clientCount: v.number(),
    bookingCount: v.number(),
  }).index("by_userId_and_monthKey", ["userId", "monthKey"]),
});
