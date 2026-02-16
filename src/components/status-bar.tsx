"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAgent, getScheduledJob, getTaskBySlug } from "@/lib/agents";

function formatLocalTime() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getBreadcrumbs(pathname: string) {
  if (pathname === "/") {
    return [{ label: "Home", href: "/", current: true }];
  }
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string; current: boolean }[] = [
    { label: "Home", href: "/", current: false },
  ];
  const [type, slug] = segments;
  if (type === "agent" && slug) {
    const agent = getAgent(slug);
    crumbs.push({
      label: agent?.name ?? slug,
      href: `/agent/${slug}`,
      current: true,
    });
  } else if (type === "job" && slug) {
    const job = getScheduledJob(slug);
    crumbs.push({
      label: job?.name ?? slug,
      href: `/job/${slug}`,
      current: true,
    });
  } else if (type === "task" && slug) {
    const task = getTaskBySlug(slug);
    crumbs.push({
      label: task?.title ?? slug,
      href: `/task/${slug}`,
      current: true,
    });
  }
  return crumbs;
}

export function StatusBar() {
  const pathname = usePathname();
  const [time, setTime] = useState(formatLocalTime);

  useEffect(() => {
    const id = setInterval(() => setTime(formatLocalTime()), 1000);
    return () => clearInterval(id);
  }, []);

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="flex items-center justify-between px-1 text-sm">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-semibold text-foreground">
          Pilot
        </span>
        <span>/</span>

        {/* <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />3 agents
          active
        </span> */}

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
      <div className="flex gap-4 items-center">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />3 agents
          active
        </span>
        <span className="text-muted-foreground">6 tasks in flight</span>
      </div>
      <div className="flex gap-4">
        <span className="font-mono text-xs text-muted-foreground">{time}</span>
        
      </div>
    </div>
  );
}
