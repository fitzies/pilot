import { notFound } from "next/navigation";
import { getAgent, getTasksForAgent } from "@/lib/agents";
import { TaskCard } from "@/components/taskboard";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();

  const { inbox, active, done } = getTasksForAgent(slug);

  const columns = [
    { title: "Inbox", tasks: inbox },
    { title: "Active", tasks: active },
    { title: "Done", tasks: done },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {/* <span className="text-3xl">{agent.emoji}</span> */}
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {agent.name}
          </h1>
          <p className="text-sm text-muted-foreground">{agent.role}</p>
        </div>
      </div>

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
              {col.tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">
                  No tasks
                </p>
              ) : (
                col.tasks.map((task) => (
                  <TaskCard key={task.slug} task={task} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
