export const dynamic = "force-dynamic";
export const revalidate = 0;

import { headers } from "next/headers";

type Totals = { impressions:number; opens:number; closes:number; clicks:number; leads:number; };
type Daily  = { day:string; impressions:number; opens:number; closes:number; clicks:number; leads:number; };
type ByPage = { page:string; impressions:number; opens:number; closes:number; clicks:number; leads:number; };

/** Handle both cases: next/headers returning Headers or Promise<Headers> */
async function readHeaders(): Promise<Headers> {
  const maybe = headers() as any;
  return (typeof maybe?.then === "function") ? await maybe : maybe;
}

async function absoluteUrl(path: string) {
  const h = await readHeaders();
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    (process.env.VERCEL_URL ?? "localhost:3000");
  const proto =
    h.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}${path}`;
}

async function getData() {
  const url = await absoluteUrl("/api/dashboard/analytics/summary?days=14");
  const r = await fetch(url, { cache: "no-store" });
  try { return await r.json(); } catch { return { ok: false }; }
}

export default async function AnalyticsPage() {
  const data = await getData();

  if (!data?.ok) {
    return <div className="p-4 text-red-300">Analytics unavailable. Please try again.</div>;
  }

  const t: Totals = data.totals ?? { impressions:0, opens:0, closes:0, clicks:0, leads:0 };
  const daily:  Daily[]  = data.daily  ?? [];
  const byPage: ByPage[] = data.by_page ?? [];
  const ctr = t.impressions > 0 ? Math.round((t.clicks / t.impressions) * 100) : 0;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ["Impr.", t.impressions],
          ["Opens", t.opens],
          ["Closes", t.closes],
          ["Clicks", t.clicks],
          ["Leads", t.leads],
        ].map(([label, val]) => (
          <div key={label as string} className="rounded border border-slate-700 bg-slate-900/50 p-3">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-xl font-bold">{String(val)}</div>
          </div>
        ))}
      </div>

      <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Totals (last {data.days} days)</h2>
          <div className="text-sm text-slate-300">CTR: {ctr}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded border border-slate-700 bg-slate-900/50 p-4 overflow-x-auto">
          <h3 className="font-semibold mb-3">Daily</h3>
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left p-2">day</th>
                <th className="text-right p-2">impressions</th>
                <th className="text-right p-2">opens</th>
                <th className="text-right p-2">closes</th>
                <th className="text-right p-2">clicks</th>
                <th className="text-right p-2">leads</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((r) => (
                <tr key={r.day} className="border-t border-slate-800">
                  <td className="p-2">{r.day}</td>
                  <td className="p-2 text-right">{r.impressions}</td>
                  <td className="p-2 text-right">{r.opens}</td>
                  <td className="p-2 text-right">{r.closes}</td>
                  <td className="p-2 text-right">{r.clicks}</td>
                  <td className="p-2 text-right">{r.leads}</td>
                </tr>
              ))}
              {daily.length === 0 && <tr><td className="p-2 text-slate-400" colSpan={6}>No data</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="rounded border border-slate-700 bg-slate-900/50 p-4 overflow-x-auto">
          <h3 className="font-semibold mb-3">By page</h3>
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left p-2">page</th>
                <th className="text-right p-2">impressions</th>
                <th className="text-right p-2">opens</th>
                <th className="text-right p-2">closes</th>
                <th className="text-right p-2">clicks</th>
                <th className="text-right p-2">leads</th>
              </tr>
            </thead>
            <tbody>
              {byPage.map((r) => (
                <tr key={r.page} className="border-t border-slate-800">
                  <td className="p-2">{r.page}</td>
                  <td className="p-2 text-right">{r.impressions}</td>
                  <td className="p-2 text-right">{r.opens}</td>
                  <td className="p-2 text-right">{r.closes}</td>
                  <td className="p-2 text-right">{r.clicks}</td>
                  <td className="p-2 text-right">{r.leads}</td>
                </tr>
              ))}
              {byPage.length === 0 && <tr><td className="p-2 text-slate-400" colSpan={6}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}