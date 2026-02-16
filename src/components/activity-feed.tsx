const events = [
  {
    agent: "Nova",
    action: "started",
    task: "Design auth flow",
    time: "5s ago",
    color: "bg-red-500",
  },
  {
    agent: "Sage",
    action: "completed",
    task: "Competitor benchmarks",
    time: "2m ago",
    color: "bg-foreground",
  },
];

export function ActivityFeed() {
  return (
    <div className="space-y-1.5">
      {events.map((event) => (
        <div
          key={event.task}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${event.color}`} />
            <span className="font-medium text-foreground">{event.agent}</span>
            <span className="text-muted-foreground">{event.action}</span>
            <span className="text-foreground">{`"${event.task}"`}</span>
          </div>
          <span className="text-xs text-muted-foreground">{event.time}</span>
        </div>
      ))}
    </div>
  );
}
