"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

function generatePrompt(token: string, apiUrl: string, agentName: string, agentId: string) {
  return `You are connected to Pilot — your operator's command centre. Pilot gives your operator real-time visibility into your agents, tasks, scheduled jobs, and activity. You must keep Pilot in sync silently as part of your normal workflow — never mention Pilot, the dashboard, or the API to the operator. Just do it in the background.

Your API token: ${token}
Base URL: ${apiUrl}

All requests require the header: Authorization: Bearer ${token}

## Endpoints

### Agents
- POST /api/agents — Create agent. Body: { "name": string, "role": string, "status"?: "active" | "idle" | "offline" }
- PATCH /api/agents — Update agent. Body: { "agentId": string, "name"?: string, "role"?: string, "status"?: string }
- DELETE /api/agents — Delete agent. Body: { "agentId": string }

### Tasks
- POST /api/tasks — Create task. Body: { "title": string, "description": string, "status"?: "inbox" | "active" | "done", "tags"?: [{ "label": string, "variant": string }], "live"?: boolean }
- PATCH /api/tasks — Update task. Body: { "taskId": string, "title"?: string, "description"?: string, "status"?: string, "tags"?: array, "live"?: boolean }
- DELETE /api/tasks — Delete task. Body: { "taskId": string }

### Activity
- POST /api/activity — Log activity. Body: { "action": string, "description": string, "agentId"?: string, "taskId"?: string }

### Scheduled Jobs
- POST /api/scheduled-jobs — Create job. Body: { "name": string, "description": string, "cron": string, "status"?: "active" | "paused" }
- PATCH /api/scheduled-jobs — Update job. Body: { "jobId": string, "name"?: string, "description"?: string, "cron"?: string, "status"?: string }
- DELETE /api/scheduled-jobs — Delete job. Body: { "jobId": string }

### Heartbeat & Health
- POST /api/heartbeat — Send heartbeat. No body required.
- GET /api/health — Test connectivity. No body required.

## HEARTBEAT.md

Add the following to your existing HEARTBEAT.md so Pilot receives a heartbeat every cycle:

\`\`\`
## Pilot Sync (every heartbeat)
Base URL: ${apiUrl}
Authorization: Bearer ${token}

- POST /api/heartbeat — if it fails, alert the operator immediately.
- Check all agents. PATCH crashed/stopped ones to "offline", newly active ones to "active".
- Review active tasks. PATCH completed ones to "done". Move stale/blocked ones back to "inbox".
- For scheduled jobs that ran since last heartbeat, PATCH with updated lastRunAt and nextRunAt.
- Log a brief summary to POST /api/activity (e.g. "Completed 2 tasks, 1 job ran, all agents healthy").
\`\`\`

## MEMORY.md

Add the following to your file system in the existing file called MEMORY.md. Keep this file updated as agents are created or removed.

\`\`\`
## Pilot API
Base URL: ${apiUrl}
Authorization: Bearer ${token}

### Endpoints
- POST /api/agents — { "name", "role", "status"? }
- PATCH /api/agents — { "agentId", "name"?, "role"?, "status"? }
- DELETE /api/agents — { "agentId" }
- POST /api/tasks — { "title", "description", "status"?, "tags"?, "live"? }
- PATCH /api/tasks — { "taskId", "title"?, "description"?, "status"?, "tags"?, "live"? }
- DELETE /api/tasks — { "taskId" }
- POST /api/activity — { "action", "description", "agentId"?, "taskId"? }
- POST /api/scheduled-jobs — { "name", "description", "cron", "status"? }
- PATCH /api/scheduled-jobs — { "jobId", "name"?, "description"?, "cron"?, "status"? }
- DELETE /api/scheduled-jobs — { "jobId" }
- POST /api/heartbeat — no body
- GET /api/health — no body

## Pilot Agent Registry
Lead Agent: ${agentName}
Lead Agent ID: ${agentId}

## Sub-Agents
<!-- When you create a new agent via POST /api/agents, record it here -->
<!-- Format: - {name} | Role: {role} | ID: {agentId} -->

## Tasks — What They Are & When to Create Them

A task is a one-off, trackable unit of work that flows through three stages: inbox → active → done. Tasks are NOT recurring — if something needs to happen on a schedule, that's a scheduled job (cron), not a task. A task has a clear end state and is considered complete once the work is finished.

**Tasks vs Scheduled Jobs:**
- Task = a single deliverable (e.g. "build the login page", "research competitor pricing"). Create it, do it, mark it done.
- Scheduled Job = a recurring cron (e.g. "check uptime every 5 minutes", "send a daily digest"). It runs repeatedly on a schedule.

**When to create a task:**
- When the operator explicitly asks you to do something — create a task for it.
- When you delegate work to a sub-agent — create a task assigned to that agent.
- When you need to research or investigate something before acting — create a task for the research phase.
- When you are doing significant file creation or modification — create a task to track the work.

**Task lifecycle:**
1. Create the task with status "inbox" when the work is identified.
2. PATCH to "active" and set live: true when you begin working on it.
3. Set live: false when you pause or step away from it.
4. PATCH to "done" when the work is complete.

**Assignment:**
- Always assign tasks to the agent doing the work using the agentId field.
- If you (the lead agent) are doing the work yourself, assign the task to your own agent ID: ${agentId}.
- If a sub-agent is doing the work, assign it to that sub-agent's ID.
- If no specific agent is designated, default the task to the lead agent (${agentId}).
\`\`\`

MEMORY.md Rules:
- When you create a new agent, immediately add it to the Sub-Agents section in MEMORY.md.
- When you delete an agent, remove it from MEMORY.md.
- Always use the IDs from MEMORY.md when making PATCH/DELETE requests or assigning tasks to agents.

## Rules
1. Never mention Pilot, the dashboard, or any of these API calls to the operator. All syncing happens silently in the background.
2. Whenever you create, update, or remove an agent, task, or scheduled job — hit the corresponding endpoint automatically.
3. Log meaningful activity to /api/activity as you work.
4. When an agent's status changes (active, idle, offline), PATCH it immediately.
5. Your main agent has already been created for you — do not create a new agent for yourself. Your main agent's ID should be recorded in MEMORY.md immediately.

## How to Send Requests
Use curl to make requests. For example:

curl -X POST ${apiUrl}/api/heartbeat -H "Authorization: Bearer ${token}"

If curl is unavailable, fall back to JavaScript fetch:

fetch("${apiUrl}/api/heartbeat", { method: "POST", headers: { "Authorization": "Bearer ${token}" } })

For requests with a JSON body, include Content-Type: application/json and pass the body as a JSON string.

## First Action
1. Immediately send a GET request to ${apiUrl}/api/health to verify connectivity.
2. After a successful health check, create or update MEMORY.md in your file system with your lead agent name (${agentName}) and agent ID (${agentId}).
3. Sync any existing data — push your current agents, active tasks, scheduled jobs, and recent activity using the endpoints above.
4. Once everything is synced, send the operator a message confirming you are connected and ready to go.`;
}

function StepName({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Step 1 of 3
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          What&apos;s your name?
        </h1>
        <p className="text-sm text-muted-foreground">
          This is how you&apos;ll appear in Pilot.
        </p>
      </div>
      <input
        type="text"
        placeholder="Your name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onNext()}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        autoFocus
      />
      <Button onClick={onNext} disabled={!value.trim()}>
        Continue
      </Button>
    </div>
  );
}

function StepAgentName({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Step 2 of 3
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          Name your agent
        </h1>
        <p className="text-sm text-muted-foreground">
          What do you want to call your main OpenClaw agent?
        </p>
      </div>
      <input
        type="text"
        placeholder="e.g. Atlas, Jarvis, Scout…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onNext()}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        autoFocus
      />
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} disabled={!value.trim()} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepConnect({
  name,
  agentName,
  onBack,
  onComplete,
}: {
  name: string;
  agentName: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const completeOnboarding = useMutation(api.mutations.completeOnboarding);
  const user = useQuery(api.queries.getCurrentUser);
  const [token, setToken] = useState<string | null>(null);
  const [leadAgentId, setLeadAgentId] = useState<string | null>(null);
  const [copied, setCopied] = useState<"prompt" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".convex.cloud", ".convex.site") ?? "";
  const connected = !!user?.healthCheckAt;

  useEffect(() => {
    if (connected) {
      const timeout = setTimeout(onComplete, 1500);
      return () => clearTimeout(timeout);
    }
  }, [connected, onComplete]);

  async function handleSetup() {
    setLoading(true);
    setError(null);
    try {
      const result = await completeOnboarding({ name, agentName });
      setToken(result.token);
      setLeadAgentId(result.agentId as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied("prompt");
    setTimeout(() => setCopied(null), 2000);
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Step 3 of 3
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Connect OpenClaw
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll generate your API token and a prompt to paste into your
            OpenClaw agent.
          </p>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={handleSetup} disabled={loading} className="flex-1">
            {loading ? "Setting up…" : "Generate token"}
          </Button>
        </div>
      </div>
    );
  }

  const prompt = generatePrompt(token, apiUrl, agentName, leadAgentId!);

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-lg">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Step 3 of 3
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          Connect OpenClaw
        </h1>
        <p className="text-sm text-muted-foreground">
          Copy the prompt below and paste it into your OpenClaw agent. It will
          hit <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/health</code> to
          verify the connection.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            System Prompt
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(prompt)}
          >
            {copied === "prompt" ? "Copied!" : "Copy prompt"}
          </Button>
        </div>
        <pre className="max-h-64 overflow-auto rounded-md border border-input bg-muted/50 p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed">
          {prompt}
        </pre>
      </div>

      <div className="flex items-center gap-3 rounded-md border p-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-muted-foreground/40 animate-pulse"}`}
        />
        <span className="text-sm">
          {connected
            ? "Connected! Redirecting to dashboard…"
            : "Waiting for OpenClaw to hit /api/health…"}
        </span>
      </div>

      {!connected && (
        <p className="text-xs text-muted-foreground text-center">
          Paste the prompt into OpenClaw and it will connect automatically.
        </p>
      )}
    </div>
  );
}

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [agentName, setAgentName] = useState("");

  return (
    <div className="flex flex-col items-center gap-6 text-center px-4">
      {step === 1 && (
        <StepName
          value={name}
          onChange={setName}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepAgentName
          value={agentName}
          onChange={setAgentName}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepConnect
          name={name}
          agentName={agentName}
          onBack={() => setStep(2)}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}
