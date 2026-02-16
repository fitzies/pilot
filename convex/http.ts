import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// ── Auth helper ──

async function authenticateRequest(
  ctx: { runQuery: any },
  request: Request,
): Promise<{ userId: Id<"users"> } | Response> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Missing or invalid Authorization header", {
      status: 401,
    });
  }

  const token = authHeader.slice(7);
  const user = await ctx.runQuery(internal.auth.getUserByToken, { token });

  if (!user) {
    return new Response("Invalid token", { status: 401 });
  }

  return { userId: user._id };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Users ──

http.route({
  path: "/api/users",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const token = crypto.randomUUID();
    const userId = await ctx.runMutation(internal.mutations.createUser, {
      externalId: body.externalId,
      token,
      name: body.name,
    });
    return json({ userId, token });
  }),
});

// ── Agents ──

http.route({
  path: "/api/agents",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const agentId = await ctx.runMutation(internal.mutations.createAgent, {
      userId: auth.userId,
      name: body.name,
      role: body.role,
      status: body.status ?? "idle",
    });
    return json({ agentId });
  }),
});

http.route({
  path: "/api/agents",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    await ctx.runMutation(internal.mutations.updateAgent, {
      agentId: body.agentId,
      name: body.name,
      role: body.role,
      status: body.status,
    });
    return json({ success: true });
  }),
});

http.route({
  path: "/api/agents",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    await ctx.runMutation(internal.mutations.deleteAgent, {
      agentId: body.agentId,
    });
    return json({ success: true });
  }),
});

// ── Tasks ──

http.route({
  path: "/api/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const taskId = await ctx.runMutation(internal.mutations.createTask, {
      userId: auth.userId,
      agentId: body.agentId,
      title: body.title,
      description: body.description,
      status: body.status ?? "inbox",
      tags: body.tags ?? [],
      live: body.live ?? false,
    });
    return json({ taskId });
  }),
});

http.route({
  path: "/api/tasks",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    await ctx.runMutation(internal.mutations.updateTask, {
      taskId: body.taskId,
      agentId: body.agentId,
      title: body.title,
      description: body.description,
      status: body.status,
      tags: body.tags,
      live: body.live,
    });
    return json({ success: true });
  }),
});

http.route({
  path: "/api/tasks",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    await ctx.runMutation(internal.mutations.deleteTask, {
      taskId: body.taskId,
    });
    return json({ success: true });
  }),
});

// ── Activity ──

http.route({
  path: "/api/activity",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const activityId = await ctx.runMutation(
      internal.mutations.createActivity,
      {
        userId: auth.userId,
        agentId: body.agentId,
        taskId: body.taskId,
        action: body.action,
        description: body.description,
      },
    );
    return json({ activityId });
  }),
});

export default http;
