export function UsageBanner({ used, quota }: { used:number; quota:number }) {
  const remaining = Math.max(quota - used, 0);
  const pct = Math.min(100, Math.round((used / quota) * 100));
  const warn = remaining <= Math.ceil(quota * 0.2);
  if (!warn) return null;
  return (
    <div className="mt-4 rounded-lg border border-amber-600/40 bg-amber-950/30 p-3 text-amber-200">
      <div className="text-sm font-medium">Heads up: you’ve used {used}/{quota} messages ({pct}%).</div>
      <div className="text-xs opacity-80">When you hit the limit, sending will pause. Consider upgrading to Pro.</div>
    </div>
  );
}