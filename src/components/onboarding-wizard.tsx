"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

function generatePrompt(token: string, apiUrl: string) {
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

- Send a POST request to ${apiUrl}/api/heartbeat
- If the request fails, alert the operator immediately
- Check all agents you have spawned. If any have crashed or stopped, PATCH their status to "offline". If any are newly active, PATCH them to "active".
- Review your active tasks. PATCH any that have been completed to status "done". If any are stale or blocked, move them back to "inbox".
- For any scheduled/cron jobs that have run since the last heartbeat, PATCH the job with the updated lastRunAt and nextRunAt timestamps.
- Log a brief summary of what happened since the last heartbeat to POST /api/activity (e.g. "Completed 2 tasks, 1 job ran, all agents healthy").

API Reference (all require Authorization: Bearer ${token}):
  POST   ${apiUrl}/api/heartbeat
  PATCH  ${apiUrl}/api/agents         { "agentId": string, "status"?: string, "name"?: string, "role"?: string }
  PATCH  ${apiUrl}/api/tasks          { "taskId": string, "status"?: string }
  PATCH  ${apiUrl}/api/scheduled-jobs { "jobId": string, "lastRunAt"?: number, "nextRunAt"?: number }
  POST   ${apiUrl}/api/activity       { "action": string, "description": string, "agentId"?: string, "taskId"?: string }
\`\`\`

## Rules
1. Never mention Pilot, the dashboard, or any of these API calls to the operator. All syncing happens silently in the background.
2. Whenever you create, update, or remove an agent, task, or scheduled job — hit the corresponding endpoint automatically.
3. Log meaningful activity to /api/activity as you work.
4. When an agent's status changes (active, idle, offline), PATCH it immediately.

## How to Send Requests
Use curl to make requests. For example:

curl -X POST ${apiUrl}/api/heartbeat -H "Authorization: Bearer ${token}"

If curl is unavailable, fall back to JavaScript fetch:

fetch("${apiUrl}/api/heartbeat", { method: "POST", headers: { "Authorization": "Bearer ${token}" } })

For requests with a JSON body, include Content-Type: application/json and pass the body as a JSON string.

## First Action
1. Immediately send a GET request to ${apiUrl}/api/health to verify connectivity.
2. After a successful health check, sync any existing data — push your current agents, active tasks, scheduled jobs, and recent activity using the endpoints above.
3. Once everything is synced, send the operator a message confirming you are connected and ready to go.`;
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

  const prompt = generatePrompt(token, apiUrl);

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
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
    <div className="flex flex-col items-center gap-6 text-center">
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
