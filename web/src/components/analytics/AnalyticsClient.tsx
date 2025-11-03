"use client";

import { useEffect, useMemo, useState } from "react";

type Totals = { impressions: number; opens: number; closes: number; clicks: number; leads: number };
type Daily = {
  day: string;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};
type ByPage = {
  page: string;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};

export default function AnalyticsClient({
  widgetId,
  initialDays = 14,
}: {
  widgetId: string;
  initialDays?: number;
}) {
  const [days, setDays] = useState<number>(initialDays);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    ok: boolean;
    days: number;
    totals: Totals;
    daily: Daily[];
    by_page: ByPage[];
  } | null>(null);

  async function load(d: number) {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/dashboard/analytics/summary?wid=${encodeURIComponent(widgetId)}&days=${d}`,
        { cache: "no-store" }
      );
      const j = await r.json().catch(() => null);
      setData(j);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(days);
  }, [days]);

  const t: Totals = data?.totals ?? { impressions: 0, opens: 0, closes: 0, clicks: 0, leads: 0 };
  const ctr = useMemo(
    () => (t.impressions > 0 ? Math.round((t.clicks / t.impressions) * 100) : 0),
    [t]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex gap-2">
          {[1, 7, 14, 30].map((d) => (
            <button
              key={d}
              className={`rounded border px-3 py-1.5 ${d === days ? "border-amber-500 bg-amber-600 text-black" : "border-slate-700 bg-slate-800 hover:bg-slate-700"}`}
              onClick={() => setDays(d)}
              disabled={loading}
            >
              {d === 1 ? "Today" : `${d} days`}
            </button>
          ))}
          <a
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 hover:bg-slate-700"
            href={`/api/dashboard/analytics/export?wid=${encodeURIComponent(widgetId)}&days=${days}`}
            target="_blank"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["Impr.", t.impressions],
          ["Opens", t.opens],
          ["Closes", t.closes],
          ["Clicks", t.clicks],
          ["Leads", t.leads],
        ].map(([label, val]) => (
          <div
            key={label as string}
            className="rounded border border-slate-700 bg-slate-900/50 p-3"
          >
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-xl font-bold">{String(val)}</div>
          </div>
        ))}
      </div>

      {/* Totals bar */}
      <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Totals (last {days} days)</h2>
          <div className="text-sm text-slate-300">CTR: {ctr}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Daily */}
        <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="mb-3 font-semibold">Daily</h3>
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="p-2 text-left">day</th>
                <th className="p-2 text-right">impressions</th>
                <th className="p-2 text-right">opens</th>
                <th className="p-2 text-right">closes</th>
                <th className="p-2 text-right">clicks</th>
                <th className="p-2 text-right">leads</th>
              </tr>
            </thead>
            <tbody>
              {(data?.daily ?? []).map((r) => (
                <tr key={r.day} className="border-t border-slate-800">
                  <td className="p-2">{r.day}</td>
                  <td className="p-2 text-right">{r.impressions}</td>
                  <td className="p-2 text-right">{r.opens}</td>
                  <td className="p-2 text-right">{r.closes}</td>
                  <td className="p-2 text-right">{r.clicks}</td>
                  <td className="p-2 text-right">{r.leads}</td>
                </tr>
              ))}
              {(data?.daily?.length ?? 0) === 0 && (
                <tr>
                  <td className="p-2 text-slate-400" colSpan={6}>
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* By page */}
        <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="mb-3 font-semibold">By page</h3>
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="p-2 text-left">page</th>
                <th className="p-2 text-right">impressions</th>
                <th className="p-2 text-right">opens</th>
                <th className="p-2 text-right">closes</th>
                <th className="p-2 text-right">clicks</th>
                <th className="p-2 text-right">leads</th>
              </tr>
            </thead>
            <tbody>
              {(data?.by_page ?? []).map((r) => (
                <tr key={r.page} className="border-t border-slate-800">
                  <td className="p-2">{r.page}</td>
                  <td className="p-2 text-right">{r.impressions}</td>
                  <td className="p-2 text-right">{r.opens}</td>
                  <td className="p-2 text-right">{r.closes}</td>
                  <td className="p-2 text-right">{r.clicks}</td>
                  <td className="p-2 text-right">{r.leads}</td>
                </tr>
              ))}
              {(data?.by_page?.length ?? 0) === 0 && (
                <tr>
                  <td className="p-2 text-slate-400" colSpan={6}>
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
