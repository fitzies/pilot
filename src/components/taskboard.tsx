import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { allTasks, getAgentName, type TaskData } from "@/lib/agents";

export function TaskCard({ task }: { task: TaskData }) {
  const agentName = getAgentName(task.agentSlug);

  return (
    <Link
      href={`/task/${task.slug}`}
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
          <Badge key={tag.label} variant={"outline"}>
            {tag.label}
          </Badge>
        ))}
      </div>
    </Link>
  );
}

const columns = [
  {
    title: "Inbox",
    tasks: allTasks.filter((t) => t.status === "inbox"),
  },
  {
    title: "Active",
    tasks: allTasks.filter((t) => t.status === "active"),
  },
  {
    title: "Done",
    tasks: allTasks.filter((t) => t.status === "done"),
  },
];

export function TaskBoard() {
  return (
    <div className="grid grid-cols-3 gap-3">
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
              <TaskCard key={task.slug} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
