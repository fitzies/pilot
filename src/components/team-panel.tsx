"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function TeamPanel() {
  const user = useQuery(api.queries.getCurrentUser);
  const agents = useQuery(
    api.queries.getAgents,
    user ? { userId: user._id } : "skip",
  );
  const tasks = useQuery(
    api.queries.getTasks,
    user ? { userId: user._id } : "skip",
  );

  if (!agents) return null;

  const liveAgentIds = new Set(
    (tasks ?? []).filter((t) => t.live && t.agentId).map((t) => t.agentId),
  );

  return (
    <div className="space-y-1 ml-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2">
        Team
      </p>
      <div className="space-y-2">
        {agents.map((agent) => (
          <Link
            key={agent._id}
            href={`/agent/${agent._id}`}
            className="block rounded-lg border bg-card p-3 space-y-1.5 hover:-translate-y-1 duration-150"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground leading-snug">
                {agent.name}
              </p>
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  liveAgentIds.has(agent._id)
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/30"
                }`}
              />
            </div>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
