import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { agents, allTasks } from "@/lib/agents";
import { Avatar } from "./ui/avatar";

const liveAgentSlugs = new Set(
  allTasks.filter((t) => t.live).map((t) => t.agentSlug)
);

export function TeamPanel() {
  return (
    <div className="space-y-1 ml-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2">
        Team
      </p>
      <div className="space-y-2">
        {agents.map((agent) => (
          <Link
            key={agent.name}
            href={`/agent/${agent.slug}`}
            className="block rounded-lg border bg-card p-3 space-y-1.5 hover:-translate-y-1 duration-150"
          >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {agent.name}
                </p>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    liveAgentSlugs.has(agent.slug)
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
