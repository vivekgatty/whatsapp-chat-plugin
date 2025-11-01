export default function PlanBadge({ plan }: { plan: "free"|"pro"|string }) {
  const color = plan === "pro" ? "bg-emerald-600" : "bg-slate-600";
  return <span className={`inline-block px-2 py-1 rounded text-white text-xs ${color}`}>{String(plan).toUpperCase()}</span>;
}