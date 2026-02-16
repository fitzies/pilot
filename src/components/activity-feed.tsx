"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed() {
  const user = useQuery(api.queries.getCurrentUser);
  const activity = useQuery(
    api.queries.getActivity,
    user ? { userId: user._id } : "skip",
  );

  if (!activity || activity.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {activity.map((event) => (
        <div
          key={event._id}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            <span className="text-muted-foreground">{event.action}</span>
            <span className="text-foreground">{`"${event.description}"`}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {timeAgo(event.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
