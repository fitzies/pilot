import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getTaskBySlug, getAgentName } from "@/lib/agents";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const task = getTaskBySlug(slug);
  if (!task) notFound();

  const agentName = getAgentName(task.agentSlug);

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
          <Badge key={tag.label} variant={"outline"}>
            {tag.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
