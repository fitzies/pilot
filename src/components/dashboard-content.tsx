"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TaskBoard } from "./taskboard";
import { OnboardingWizard } from "./onboarding-wizard";

export function DashboardContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.queries.getCurrentUser);

  if (isLoading || user === undefined) return null;

  if (isAuthenticated && (user === null || !user.onboardingComplete)) {
    return <OnboardingWizard onComplete={() => window.location.reload()} />;
  }

  return <TaskBoard />;
}
