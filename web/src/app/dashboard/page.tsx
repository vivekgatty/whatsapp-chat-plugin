import PlanBadge from "@/components/PlanBadge";
import { UsageBanner } from "@/components/UsageBanner";
export const dynamic = "force-dynamic";
/** stamp: 2025-11-01_07-37-21 */

async function fetchOverview() {
  try {
    const r = await fetch("/api/business/overview", { cache: "no-store" });
    if (!r.ok) return {};
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return {};
    return await r.json();
  } catch {
    return {};
  }
}

export default async function DashboardPage() {
  const o: any = await fetchOverview();
  const plan  = o?.plan  ?? "free";
  const used  = o?.used  ?? 0;
  const quota = o?.quota ?? 100;
  const biz   = o?.business ?? {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard <PlanBadge plan={plan} /></h1>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-700 p-4">
          <div className="font-medium mb-2">Business profile</div>
          <div className="text-sm text-slate-300 space-y-1">
            <div><span className="opacity-70">Name:</span> {biz?.name ?? "-"}</div>
            <div><span className="opacity-70">Website:</span> {biz?.website ?? "https://chatmadi.com"}</div>
            <div><span className="opacity-70">Email:</span> {biz?.email ?? "admin@chatmadi.com"}</div>
            <div><span className="opacity-70">Phone:</span> {biz?.phone ?? "9591428002"}</div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 p-4">
          <div className="font-medium mb-2">Usage</div>
          <div className="text-sm text-slate-300">Messages this month: {used} / {quota}</div>
          <UsageBanner used={used} quota={quota} />
        </div>

        <div className="rounded-lg border border-slate-700 p-4">
          <div className="font-medium mb-2">Billing</div>
          <div className="text-sm text-slate-300">
            View receipts on the <a className="underline" href="/billing">Billing page</a>.
          </div>
        </div>
      </div>
    </div>
  );
}