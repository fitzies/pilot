"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

function parseCronNextRun(cron: string): Date {
  const [minute, hour, dayOfMonth, , dayOfWeek] = cron.split(" ");
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0, 0);

  if (dayOfWeek !== "*") {
    const target = parseInt(dayOfWeek);
    let daysAhead = target - now.getDay();
    if (daysAhead <= 0) daysAhead += 7;
    next.setDate(now.getDate() + daysAhead);
    next.setHours(hour === "*" ? 0 : parseInt(hour));
    next.setMinutes(minute === "*" ? 0 : parseInt(minute));
    return next;
  }

  if (dayOfMonth !== "*") {
    const target = parseInt(dayOfMonth);
    next.setDate(target);
    next.setHours(hour === "*" ? 0 : parseInt(hour));
    next.setMinutes(minute === "*" ? 0 : parseInt(minute));
    if (next <= now) next.setMonth(next.getMonth() + 1);
    return next;
  }

  if (hour !== "*") {
    const interval = hour.includes("*/") ? parseInt(hour.split("*/")[1]) : null;
    if (interval) {
      const currentHour = now.getHours();
      const nextHour = Math.ceil((currentHour + 1) / interval) * interval;
      next.setHours(nextHour);
      next.setMinutes(minute === "*" ? 0 : parseInt(minute));
      if (next <= now) next.setDate(next.getDate() + 1);
    } else {
      next.setHours(parseInt(hour));
      next.setMinutes(minute === "*" ? 0 : parseInt(minute));
      if (next <= now) next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (minute !== "*") {
    const interval = minute.includes("*/")
      ? parseInt(minute.split("*/")[1])
      : null;
    if (interval) {
      const currentMin = now.getMinutes();
      const nextMin = Math.ceil((currentMin + 1) / interval) * interval;
      next.setMinutes(nextMin % 60);
      if (nextMin >= 60) next.setHours(next.getHours() + 1);
    } else {
      next.setMinutes(parseInt(minute));
      if (next <= now) next.setHours(next.getHours() + 1);
    }
    return next;
  }

  next.setMinutes(now.getMinutes() + 1);
  return next;
}

function formatRelative(diffSec: number): string {
  if (diffSec < 60) return `in ${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `in ${days}d ${hours % 24}h`;
}

export default function JobPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = id as Id<"scheduledJobs">;

  const job = useQuery(api.queries.getScheduledJob, { jobId });
  const user = useQuery(api.queries.getCurrentUser);
  const agents = useQuery(
    api.queries.getAgents,
    user ? { userId: user._id } : "skip",
  );

  if (job === undefined)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  if (job === null) return <p className="text-sm text-muted-foreground">Job not found.</p>;

  const nextRun = parseCronNextRun(job.cron);
  const diffSec = Math.max(0, Math.round((nextRun.getTime() - Date.now()) / 1000));
  const agentName = job.agentId
    ? (agents ?? []).find((a) => a._id === job.agentId)?.name
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {job.name}
        </h1>
        <p className="text-sm text-muted-foreground">{job.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-3 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          <p className="text-sm font-medium text-foreground capitalize">
            {job.status}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Schedule
          </p>
          <p className="text-sm font-mono text-foreground">{job.cron}</p>
        </div>

        <div className="rounded-lg border bg-card p-3 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Next Run
          </p>
          <p className="text-sm font-medium text-foreground">
            {job.status === "active" ? formatRelative(diffSec) : "Paused"}
          </p>
        </div>
      </div>

      {agentName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Assigned to</span>
          <Badge variant="secondary">{agentName}</Badge>
        </div>
      )}
    </div>
  );
}
