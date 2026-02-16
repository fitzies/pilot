import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ── Users ──

export const createUser = internalMutation({
  args: {
    externalId: v.string(),
    token: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      externalId: args.externalId,
      token: args.token,
      name: args.name,
      onboardingComplete: false,
      createdAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (existing) {
      return { token: existing.token, userId: existing._id };
    }

    const token = crypto.randomUUID();
    const userId = await ctx.db.insert("users", {
      externalId: identity.subject,
      token,
      name: args.name,
      onboardingComplete: false,
      createdAt: Date.now(),
    });

    const agentId = await ctx.db.insert("agents", {
      userId,
      name: args.agentName,
      role: "main",
      status: "idle",
      createdAt: Date.now(),
    });

    return { token, userId, agentId };
  },
});

export const updateUser = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    await ctx.db.patch(userId, fields);
  },
});

// ── Agents ──

export const createAgent = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    role: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("idle"),
      v.literal("offline"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateAgent = internalMutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("idle"),
        v.literal("offline"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { agentId, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(agentId, patch);
  },
});

export const deleteAgent = internalMutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.agentId);
  },
});

// ── Tasks ──

export const createTask = internalMutation({
  args: {
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("active"),
      v.literal("done"),
    ),
    tags: v.array(v.object({ label: v.string(), variant: v.string() })),
    live: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateTask = internalMutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.optional(v.id("agents")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("active"),
        v.literal("done"),
      ),
    ),
    tags: v.optional(
      v.array(v.object({ label: v.string(), variant: v.string() })),
    ),
    live: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(taskId, patch);
  },
});

export const deleteTask = internalMutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});

// ── Activity ──

export const createActivity = internalMutation({
  args: {
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    action: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Health & Heartbeat ──

export const updateHealthCheck = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      healthCheckAt: Date.now(),
      onboardingComplete: true,
    });
  },
});

export const updateHeartbeat = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { lastHeartbeatAt: Date.now() });
  },
});

// ── Scheduled Jobs ──

export const createScheduledJob = internalMutation({
  args: {
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
    name: v.string(),
    description: v.string(),
    cron: v.string(),
    status: v.union(v.literal("active"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledJobs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateScheduledJob = internalMutation({
  args: {
    jobId: v.id("scheduledJobs"),
    agentId: v.optional(v.id("agents")),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    cron: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"))),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(jobId, patch);
  },
});

export const deleteScheduledJob = internalMutation({
  args: { jobId: v.id("scheduledJobs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.jobId);
  },
});
