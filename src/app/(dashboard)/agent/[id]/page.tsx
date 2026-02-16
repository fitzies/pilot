"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { TaskCard } from "@/components/taskboard";
import { Spinner } from "@/components/ui/spinner";

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const agentId = id as Id<"agents">;

  const agent = useQuery(api.queries.getAgent, { agentId });
  const user = useQuery(api.queries.getCurrentUser);
  const tasks = useQuery(
    api.queries.getTasks,
    user ? { userId: user._id } : "skip",
  );
  const agents = useQuery(
    api.queries.getAgents,
    user ? { userId: user._id } : "skip",
  );

  if (agent === undefined || tasks === undefined)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  if (agent === null) return <p className="text-sm text-muted-foreground">Agent not found.</p>;

  const agentTasks = (tasks ?? []).filter((t) => t.agentId === agentId);
  const columns = [
    { title: "Inbox", tasks: agentTasks.filter((t) => t.status === "inbox") },
    { title: "Active", tasks: agentTasks.filter((t) => t.status === "active") },
    { title: "Done", tasks: agentTasks.filter((t) => t.status === "done") },
  ];

  const getAgentName = (aId?: Id<"agents">) =>
    (agents ?? []).find((a) => a._id === aId)?.name ?? "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {agent.name}
          </h1>
          <p className="text-sm text-muted-foreground">{agent.role}</p>
        </div>
      </div>

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
              {col.tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">No tasks</p>
              ) : (
                col.tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    agentName={getAgentName(task.agentId)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
