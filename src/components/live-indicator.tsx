export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${className ?? ""}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      <span className="text-red-600">LIVE</span>
    </span>
  );
}
