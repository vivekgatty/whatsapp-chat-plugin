export default function PlanBadge({ plan }: { plan: "free" | "pro" | string }) {
  const color = plan === "pro" ? "bg-emerald-600" : "bg-slate-600";
  return (
    <span className={`inline-block rounded px-2 py-1 text-xs text-white ${color}`}>
      {String(plan).toUpperCase()}
    </span>
  );
}
