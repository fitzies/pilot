"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Doc, Id } from "../../convex/_generated/dataModel";

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

function getNextRun(cron: string): string {
  const next = parseCronNextRun(cron);
  const diffSec = Math.max(0, Math.round((next.getTime() - Date.now()) / 1000));
  return formatRelative(diffSec);
}

function getAgentName(
  agents: Doc<"agents">[] | undefined,
  agentId?: Id<"agents">,
) {
  if (!agents || !agentId) return undefined;
  return agents.find((a) => a._id === agentId)?.name;
}

export function ScheduledJobsPanel({ onNavigate }: { onNavigate?: () => void } = {}) {
  const user = useQuery(api.queries.getCurrentUser);
  const jobs = useQuery(
    api.queries.getScheduledJobs,
    user ? { userId: user._id } : "skip",
  );
  const agents = useQuery(
    api.queries.getAgents,
    user ? { userId: user._id } : "skip",
  );

  if (!jobs) return null;

  return (
    <div className="space-y-1 w-full">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2">
        Scheduled Jobs
      </p>
      <div className="space-y-2">
        {jobs.map((job) => {
          const agentName = getAgentName(agents, job.agentId);
          return (
            <Link
              href={`/job/${job._id}`}
              key={job._id}
              onClick={onNavigate}
              className="block rounded-lg border bg-card p-3 space-y-1.5 hover:-translate-y-1 duration-150"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {job.name}
                </p>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    job.status === "active"
                      ? "bg-emerald-500"
                      : "bg-muted-foreground/30"
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground">{job.description}</p>
              <div className="flex items-center justify-between">
                {agentName && (
                  <Badge variant="outline">{agentName}</Badge>
                )}
                {job.status === "active" ? (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                    {getNextRun(job.cron)}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    Paused
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
