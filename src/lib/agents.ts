export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export interface TaskData {
  slug: string;
  title: string;
  agentSlug: string;
  description: string;
  tags: { label: string; variant: BadgeVariant }[];
  status: "inbox" | "active" | "done";
  live?: boolean;
  iconName?: "monitor";
}

export const agents = [
  { name: "Jarvis", role: "Lead", emoji: "🤖", slug: "jarvis" },
  { name: "Sage", role: "Research", emoji: "🔬", slug: "sage" },
  { name: "Nova", role: "Developer", emoji: "🔧", slug: "nova" },
  { name: "Ink", role: "Writer", emoji: "✏️", slug: "ink" },
] as const;

export type AgentSlug = (typeof agents)[number]["slug"];

export const allTasks: TaskData[] = [
  {
    slug: "write-onboarding-docs",
    title: "Write onboarding docs",
    agentSlug: "ink",
    description: "Draft onboarding documentation",
    tags: [{ label: "docs", variant: "destructive" }],
    status: "inbox",
  },
  {
    slug: "design-auth-flow",
    title: "Design auth flow",
    agentSlug: "nova",
    description: "Design system authentication",
    status: "active",
    live: true,
    tags: [{ label: "design", variant: "destructive" }],
    iconName: "monitor",
  },
  {
    slug: "market-analysis",
    title: "Market analysis",
    agentSlug: "sage",
    description: "Competitive landscape research",
    status: "active",
    live: true,
    tags: [{ label: "research", variant: "secondary" }],
  },
  {
    slug: "competitor-benchmarks",
    title: "Competitor benchmarks",
    agentSlug: "sage",
    description: "Initial benchmark report",
    tags: [{ label: "research", variant: "outline" }],
    status: "done",
  },
];

export interface ScheduledJobData {
  slug: string;
  name: string;
  description: string;
  cron: string;
  status: "active" | "paused";
  agentSlug?: string;
}

export const scheduledJobs: ScheduledJobData[] = [
  { slug: "daily-digest", name: "Daily digest", description: "Compile activity summary", cron: "0 9 * * *", status: "active", agentSlug: "jarvis" },
  { slug: "competitor-scan", name: "Competitor scan", description: "Scrape competitor updates", cron: "0 */6 * * *", status: "active", agentSlug: "sage" },
  { slug: "docs-sync", name: "Docs sync", description: "Sync external docs repo", cron: "0 0 * * 1", status: "paused", agentSlug: "ink" },
];

export function getScheduledJob(slug: string) {
  return scheduledJobs.find((j) => j.slug === slug);
}

export function getAgent(slug: string) {
  return agents.find((a) => a.slug === slug);
}

export function getTaskBySlug(slug: string) {
  return allTasks.find((t) => t.slug === slug);
}

export function getTasksForAgent(slug: string) {
  const tasks = allTasks.filter((t) => t.agentSlug === slug);
  return {
    inbox: tasks.filter((t) => t.status === "inbox"),
    active: tasks.filter((t) => t.status === "active"),
    done: tasks.filter((t) => t.status === "done"),
  };
}

export function getAgentName(slug: string) {
  return getAgent(slug)?.name ?? slug;
}
