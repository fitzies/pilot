"use client";

import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { Menu } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { ActivityFeed } from "@/components/activity-feed";
import { StatusBar } from "@/components/status-bar";
import { ScheduledJobsPanel } from "@/components/scheduled-jobs-panel";
import { TeamPanel } from "@/components/team-panel";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.queries.getCurrentUser);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (isLoading || user === undefined) return null;

  if (!isAuthenticated || user === null || !user.onboardingComplete) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        {children}
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background px-3 py-3 md:px-4 md:py-4">
      <div className="flex shrink-0 items-center gap-3 lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent">
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto px-6">
            <SheetHeader>
              <SheetTitle className="text-sm">Pilot</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-4">
              <TeamPanel onNavigate={() => setSheetOpen(false)} />
              <Separator />
              <ScheduledJobsPanel onNavigate={() => setSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1 min-w-0">
          <StatusBar />
        </div>
      </div>

      <div className="hidden shrink-0 lg:block">
        <StatusBar />
      </div>

      <Separator className="my-3 shrink-0 md:my-4" />

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden lg:gap-6">
        <div className="hidden h-full min-h-0 overflow-y-auto lg:block lg:w-48 shrink-0 pl-2">
          <TeamPanel />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto lg:border-l lg:border-r lg:border-border px-0 md:px-4 lg:px-6">
          {children}
        </div>
        <div className="hidden h-full min-h-0 overflow-y-auto md:block md:w-56 shrink-0 pr-2 lg:w-64">
          <ScheduledJobsPanel />
        </div>
      </div>

      <Separator className="my-3 shrink-0 md:my-4" />

      <div className="max-h-32 shrink-0 overflow-y-auto">
        <ActivityFeed />
      </div>
    </main>
  );
}
