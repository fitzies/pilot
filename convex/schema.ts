import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    externalId: v.string(),
    token: v.string(),
    name: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    healthCheckAt: v.optional(v.number()),
    lastHeartbeatAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_externalId", ["externalId"]),

  agents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    role: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("idle"),
      v.literal("offline"),
    ),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  tasks: defineTable({
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("active"),
      v.literal("done"),
    ),
    tags: v.array(
      v.object({
        label: v.string(),
        variant: v.string(),
      }),
    ),
    live: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  activity: defineTable({
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    action: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  scheduledJobs: defineTable({
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
    name: v.string(),
    description: v.string(),
    cron: v.string(),
    status: v.union(v.literal("active"), v.literal("paused")),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
