export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getSupabaseServer } from "../../../lib/supabaseServer";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

type DailyRow = { day:string; impressions:number; opens:number; closes:number; clicks:number; leads:number; };
type PageRow  = { page:string; impressions:number; opens:number; closes:number; clicks:number; leads:number; };
type Totals   = { impressions:number; opens:number; closes:number; clicks:number; leads:number; };

function clampDays(raw: any): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v ?? "14", 10);
  if (!Number.isFinite(n) || n <= 0) return 14;
  return Math.min(n, 90);
}

async function pickWidgetId(supa: any, sp: any): Promise<string> {
  // 1) Allow explicit override via ?wid=
  const explicit = Array.isArray(sp?.wid) ? sp.wid[0] : sp?.wid;
  if (explicit && typeof explicit === "string") return explicit;

  // 2) Prefer newest widget that HAS a business_id
  const { data: wHasBiz } = await supa
    .from("widgets")
    .select("id,business_id")
    .not("business_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (wHasBiz?.id) return wHasBiz.id as string;

  // 3) Otherwise fallback to your primary widget id (from project notes)
  return "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
}

async function loadData(sp: any) {
  const days = clampDays(sp?.days);
  const supa = await getSupabaseServer();
  const widgetId = await pickWidgetId(supa, sp);

  const admin = getSupabaseAdmin();
  const { data: daily }   = await admin.rpc("daily_analytics", { p_widget_id: widgetId, p_days: days });
  const { data: by_page } = await admin.rpc("page_analytics",  { p_widget_id: widgetId, p_days: days });

  const d: DailyRow[] = (daily  ?? []) as DailyRow[];
  const p: PageRow[]  = (by_page ?? []) as PageRow[];
  const totals: Totals = d.reduce(
    (acc, r) => ({
      impressions: acc.impressions + (r.impressions || 0),
      opens:       acc.opens       + (r.opens || 0),
      closes:      acc.closes      + (r.closes || 0),
      clicks:      acc.clicks      + (r.clicks || 0),
      leads:       acc.leads       + (r.leads || 0),
    }),
    { impressions: 0, opens: 0, closes: 0, clicks: 0, leads: 0 }
  );

  return { widgetId, days, totals, daily: d, by_page: p };
}

function StatCard({ label, value }: { label:string; value:number }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900/50 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function DaysLink({ d, current }: { d:number; current:number }) {
  const isActive = d === current;
  const cls = isActive
    ? "px-3 py-1 rounded bg-amber-600 text-black font-medium"
    : "px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200";
  return <Link href={`?days=${d}`} className={cls}>{d === 1 ? "Today" : `${d} days`}</Link>;
}

export default async function Page(props: any) {
  // Next.js 15 can pass searchParams as a Promise; normalize it.
  const sp = typeof props?.searchParams?.then === "function"
    ? await props.searchParams
    : props?.searchParams;

  const { widgetId, days, totals, daily, by_page } = await loadData(sp);
  const ctr = totals.impressions > 0 ? Math.round((totals.clicks / totals.impressions) * 100) : 0;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <DaysLink d={1}  current={days} />
          <DaysLink d={7}  current={days} />
          <DaysLink d={14} current={days} />
          <DaysLink d={30} current={days} />
          <a
            className="ml-2 px-3 py-1 rounded bg-slate-800 border border-slate-700"
            href={`/api/dashboard/analytics/export?wid=${widgetId}&days=${days}`}
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Impr."  value={totals.impressions} />
        <StatCard label="Opens"  value={totals.opens} />
        <StatCard label="Closes" value={totals.closes} />
        <StatCard label="Clicks" value={totals.clicks} />
        <StatCard label="Leads"  value={totals.leads} />
      </div>

      <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Totals (last {days} {days === 1 ? "day" : "days"})</h2>
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
              {daily.map((r: DailyRow) => (
                <tr key={r.day} className="border-t border-slate-800">
                  <td className="p-2">{r.day}</td>
                  <td className="p-2 text-right">{r.impressions}</td>
                  <td className="p-2 text-right">{r.opens}</td>
                  <td className="p-2 text-right">{r.closes}</td>
                  <td className="p-2 text-right">{r.clicks}</td>
                  <td className="p-2 text-right">{r.leads}</td>
                </tr>
              ))}
              {daily.length === 0 && (
                <tr><td className="p-2 text-slate-400" colSpan={6}>No data</td></tr>
              )}
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
              {by_page.map((r: PageRow) => (
                <tr key={r.page} className="border-t border-slate-800">
                  <td className="p-2">{r.page}</td>
                  <td className="p-2 text-right">{r.impressions}</td>
                  <td className="p-2 text-right">{r.opens}</td>
                  <td className="p-2 text-right">{r.closes}</td>
                  <td className="p-2 text-right">{r.clicks}</td>
                  <td className="p-2 text-right">{r.leads}</td>
                </tr>
              ))}
              {by_page.length === 0 && (
                <tr><td className="p-2 text-slate-400" colSpan={6}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}