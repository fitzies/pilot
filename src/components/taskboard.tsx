"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Doc, Id } from "../../convex/_generated/dataModel";

function getAgentName(
  agents: Doc<"agents">[] | undefined,
  agentId?: Id<"agents">,
) {
  if (!agents || !agentId) return "Unassigned";
  return agents.find((a) => a._id === agentId)?.name ?? "Unknown";
}

export function TaskCard({
  task,
  agentName,
}: {
  task: Doc<"tasks">;
  agentName: string;
}) {
  return (
    <Link
      href={`/task/${task._id}`}
      className="block w-full text-left rounded-lg border bg-card p-3 space-y-2.5 hover:-translate-y-1 duration-150"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground leading-snug">
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground shrink-0">
              {agentName}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{task.description}</p>
        </div>
        {task.status === "done" && (
          <Check className="h-4 w-4 text-muted-foreground mt-0.5" />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {task.tags.map((tag) => (
          <Badge key={tag.label} variant="outline">
            {tag.label}
          </Badge>
        ))}
      </div>
    </Link>
  );
}

export function TaskBoard() {
  const user = useQuery(api.queries.getCurrentUser);
  const tasks = useQuery(
    api.queries.getTasks,
    user ? { userId: user._id } : "skip",
  );
  const agents = useQuery(
    api.queries.getAgents,
    user ? { userId: user._id } : "skip",
  );

  if (!tasks || !agents) return null;

  const columns = [
    { title: "Inbox", tasks: tasks.filter((t) => t.status === "inbox") },
    { title: "Active", tasks: tasks.filter((t) => t.status === "active") },
    { title: "Done", tasks: tasks.filter((t) => t.status === "done") },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {columns.map((col) => (
        <div key={col.title} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {col.title}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {col.tasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {col.tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                agentName={getAgentName(agents, task.agentId)}
              />
            ))}
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
          No Tasks
        </div>
      )}
    </div>
  );
}
