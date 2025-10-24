"use client";

import { useEffect, useMemo, useState } from "react";

type RangeKey = "today" | "7d" | "14d" | "30d";
type DailyRow = {
  day: string;
  widget_id?: string;
  business_id?: string | null;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};
type PageRow = {
  page: string;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};
type ApiResp = {
  ok: boolean;
  widget_id: string;
  range: { from: string; to: string; key: RangeKey };
  today: Omit<DailyRow, "day">;
  totals: { impressions: number; opens: number; closes: number; clicks: number; leads: number; ctr: number };
  daily: DailyRow[];
  byPage: PageRow[];
};

const DEFAULT_WIDGET_ID = "3e7ec6a9-bd9e-40a9-86fd-d1d09c84bbbf";

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("14d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResp | null>(null);

  const widgetId = useMemo(() => {
    if (typeof window === "undefined") return DEFAULT_WIDGET_ID;
    const u = new URL(window.location.href);
    return u.searchParams.get("widget_id") || DEFAULT_WIDGET_ID;
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch(`/api/analytics?widget_id=${encodeURIComponent(widgetId)}&range=${range}`, {
        cache: "no-store",
      });
      const j = (await r.json()) as ApiResp;
      if (!j.ok) throw new Error((j as any).error || "Failed");
      setData(j);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, widgetId]);

  function RangeButton({ k, label }: { k: RangeKey; label: string }) {
    const active = range === k;
    return (
      <button
        onClick={() => setRange(k)}
        className={`px-3 py-1 rounded-xl border ${active ? "bg-white/10" : "bg-white/5"} hover:bg-white/10`}
      >
        {label}
      </button>
    );
  }

  function exportDailyCsv() {
    if (!data) return;
    const rows = [
      ["day", "impressions", "opens", "closes", "clicks", "leads"],
      ...data.daily.map((d) => [d.day, d.impressions, d.opens, d.closes, d.clicks, d.leads]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-daily-${data.range.from}_to_${data.range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen text-slate-100 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-6">Widget Analytics</h1>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="text-sm opacity-70">Widget ID:</div>
          <code className="text-sm px-2 py-1 bg-white/5 rounded">{widgetId}</code>
          <div className="flex-1" />
          <RangeButton k="today" label="Today" />
          <RangeButton k="7d" label="7 days" />
          <RangeButton k="14d" label="14 days" />
          <RangeButton k="30d" label="30 days" />
          <button onClick={exportDailyCsv} className="px-3 py-1 rounded-xl border bg-white/5 hover:bg-white/10">
            Export CSV
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
            <div className="h-40 rounded-2xl bg-white/5 animate-pulse col-span-full" />
            <div className="h-64 rounded-2xl bg-white/5 animate-pulse col-span-full" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-900/30 border border-red-800 mb-6">
            <div className="font-semibold">Error</div>
            <div className="text-sm opacity-80">{error}</div>
            <button onClick={load} className="mt-3 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Impr.", value: data.today.impressions },
                { label: "Opens", value: data.today.opens },
                { label: "Closes", value: data.today.closes },
                { label: "Clicks", value: data.today.clicks },
                { label: "Leads", value: data.today.leads },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl border bg-white/5 p-4">
                  <div className="text-xs opacity-60">{k.label}</div>
                  <div className="text-2xl font-semibold mt-2">{k.value}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-2xl border bg-white/5 p-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="font-semibold">Totals ({data.range.from} → {data.range.to})</div>
                <div className="opacity-60">CTR: {data.totals.ctr}%</div>
              </div>
              <div className="mt-2 text-sm">
                Impr: <b>{data.totals.impressions}</b> · Opens: <b>{data.totals.opens}</b> · Closes:{" "}
                <b>{data.totals.closes}</b> · Clicks: <b>{data.totals.clicks}</b> · Leads: <b>{data.totals.leads}</b>
              </div>
            </div>

            {/* Daily table */}
            <section className="rounded-2xl border bg-white/5 p-4 mb-8">
              <h3 className="font-semibold mb-3">Daily</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left opacity-60">
                    <tr>
                      <th className="py-2 pr-6">day</th>
                      <th className="py-2 pr-6">impressions</th>
                      <th className="py-2 pr-6">opens</th>
                      <th className="py-2 pr-6">closes</th>
                      <th className="py-2 pr-6">clicks</th>
                      <th className="py-2 pr-6">leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((d) => (
                      <tr key={d.day} className="border-t border-white/10">
                        <td className="py-2 pr-6">{d.day}</td>
                        <td className="py-2 pr-6">{d.impressions}</td>
                        <td className="py-2 pr-6">{d.opens}</td>
                        <td className="py-2 pr-6">{d.closes}</td>
                        <td className="py-2 pr-6">{d.clicks}</td>
                        <td className="py-2 pr-6">{d.leads}</td>
                      </tr>
                    ))}
                    {!data.daily.length && (
                      <tr>
                        <td className="py-4 opacity-60" colSpan={6}>
                          No data in range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* By Page table */}
            <section className="rounded-2xl border bg-white/5 p-4">
              <h3 className="font-semibold mb-3">By page</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left opacity-60">
                    <tr>
                      <th className="py-2 pr-6">page</th>
                      <th className="py-2 pr-6">impressions</th>
                      <th className="py-2 pr-6">opens</th>
                      <th className="py-2 pr-6">closes</th>
                      <th className="py-2 pr-6">clicks</th>
                      <th className="py-2 pr-6">leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byPage.map((p) => (
                      <tr key={p.page} className="border-t border-white/10">
                        <td className="py-2 pr-6">
                          {p.page.startsWith("http") ? (
                            <a href={p.page} target="_blank" className="underline">
                              {p.page}
                            </a>
                          ) : (
                            p.page
                          )}
                        </td>
                        <td className="py-2 pr-6">{p.impressions}</td>
                        <td className="py-2 pr-6">{p.opens}</td>
                        <td className="py-2 pr-6">{p.closes}</td>
                        <td className="py-2 pr-6">{p.clicks}</td>
                        <td className="py-2 pr-6">{p.leads}</td>
                      </tr>
                    ))}
                    {!data.byPage.length && (
                      <tr>
                        <td className="py-4 opacity-60" colSpan={6}>
                          No page data in range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
