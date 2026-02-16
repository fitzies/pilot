import { ActivityFeed } from "@/components/activity-feed";
import { StatusBar } from "@/components/status-bar";
import { ScheduledJobsPanel } from "@/components/scheduled-jobs-panel";
import { TeamPanel } from "@/components/team-panel";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-4">
      <StatusBar />

      <Separator className="my-4" />

      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-48 shrink-0">
          <TeamPanel />
        </div>
        <div className="flex-1 min-w-0 border-l border-r border-border px-6">
          {children}
        </div>
        <div className="w-64 shrink-">
          <ScheduledJobsPanel />
        </div>
      </div>

      <Separator className="my-4" />

      <ActivityFeed />
    </main>
  );
}
