"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function formatLocalTime() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function useRouteEntity(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const [type, id] = segments;

  const agent = useQuery(
    api.queries.getAgent,
    type === "agent" && id ? { agentId: id as Id<"agents"> } : "skip",
  );
  const task = useQuery(
    api.queries.getTask,
    type === "task" && id ? { taskId: id as Id<"tasks"> } : "skip",
  );
  const job = useQuery(
    api.queries.getScheduledJob,
    type === "job" && id ? { jobId: id as Id<"scheduledJobs"> } : "skip",
  );

  if (type === "agent" && id) return { label: agent?.name ?? "Agent", href: `/agent/${id}` };
  if (type === "task" && id) return { label: task?.title ?? "Task", href: `/task/${id}` };
  if (type === "job" && id) return { label: job?.name ?? "Job", href: `/job/${id}` };
  return null;
}

const HEARTBEAT_THRESHOLD_MS = 45 * 60 * 1000;
const ONBOARDED_GRACE_MS = 30 * 60 * 1000;

export function StatusBar() {
  const pathname = usePathname();
  const [now, setNow] = useState(Date.now);
  const user = useQuery(api.queries.getCurrentUser);
  const agents = useQuery(
    api.queries.getAgents,
    user ? { userId: user._id } : "skip",
  );
  const entity = useRouteEntity(pathname);

  const aiName =
    agents?.find((a) => a.role === "main")?.name ?? agents?.[0]?.name ?? "AI";

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const breadcrumbs: { label: string; href: string; current: boolean }[] = [
    { label: "Home", href: "/", current: !entity },
  ];
  if (entity) {
    breadcrumbs.push({ ...entity, current: true });
    breadcrumbs[0].current = false;
  }

  const heartbeat = user?.lastHeartbeatAt;
  const createdAt = user?.createdAt;
  const status =
    heartbeat === undefined || heartbeat === null
      ? createdAt !== undefined &&
          createdAt !== null &&
          now - createdAt > ONBOARDED_GRACE_MS
        ? "Offline"
        : "Onboarded"
      : now - heartbeat < HEARTBEAT_THRESHOLD_MS
        ? "Online"
        : "Offline";

  return (
    <div className="grid grid-cols-3 items-center px-1 text-sm">
      <div className="flex items-center gap-4 min-w-0">
        <span className="flex items-center gap-1.5 font-semibold text-foreground shrink-0">
          Pilot
        </span>
        <span className="shrink-0">/</span>

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.flatMap((crumb, i) => [
              ...(i > 0 ? [<BreadcrumbSeparator key={`sep-${i}`} />] : []),
              <BreadcrumbItem key={crumb.href}>
                {crumb.current ?
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                : <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                }
              </BreadcrumbItem>,
            ])}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex justify-center">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "Online" || status === "Onboarded"
                ? "bg-emerald-500"
                : "bg-muted-foreground/40"
            }`}
          />
          {aiName} {status}
        </span>
      </div>
      <div className="flex justify-end gap-4 items-center">
        <span className="font-mono text-xs text-muted-foreground">
          {formatLocalTime()}
        </span>
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
