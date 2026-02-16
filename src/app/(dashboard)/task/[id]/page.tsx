"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export default function TaskPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = id as Id<"tasks">;

  const task = useQuery(api.queries.getTask, { taskId });
  const user = useQuery(api.queries.getCurrentUser);
  const agents = useQuery(
    api.queries.getAgents,
    user ? { userId: user._id } : "skip",
  );

  if (task === undefined)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  if (task === null) return <p className="text-sm text-muted-foreground">Task not found.</p>;

  const agentName = task.agentId
    ? (agents ?? []).find((a) => a._id === task.agentId)?.name ?? "Unknown"
    : "Unassigned";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{task.title}</h2>
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Agent: {agentName}</span>
        <span className="capitalize">Status: {task.status}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {task.tags.map((tag) => (
          <Badge key={tag.label} variant="outline">
            {tag.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
