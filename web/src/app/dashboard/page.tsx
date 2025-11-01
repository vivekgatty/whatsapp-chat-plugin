/** stamp: 2025-11-01_08-30-23 */
import PlanBadge from "@/components/PlanBadge";
import { UsageBanner } from "@/components/UsageBanner";
export const dynamic = "force-dynamic";

async function getOverview() {
  try {
    const r = await fetch("/api/business/overview", { cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(String(data?.error ?? r.status));
    return data;
  } catch {
    // Never crash the page – show sensible defaults
    return { plan: "free", used: 0, quota: 100, business: null };
  }
}

export default async function DashboardPage() {
  const o = await getOverview();
  const plan  = o?.plan ?? "free";
  const used  = o?.used ?? 0;
  const quota = o?.quota ?? 100;
  const biz   = o?.business ?? {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <PlanBadge plan={plan} />
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex flex-wrap gap-3">
        <a className="px-3 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700" href="/dashboard/profile">Edit profile</a>
        <a className="px-3 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700" href="/dashboard/widget">Widget settings</a>
        <a className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500" href="/pricing">Manage plan</a>
      </div>

      <div className="space-y-6 mt-6">
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