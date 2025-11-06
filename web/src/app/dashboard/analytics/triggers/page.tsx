"use client";

import { useEffect, useState } from "react";

type Row = {
  when: string;
  trigger: string;
  type: string;
  why: string;
  page: string;
  locale: string;
};

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [days, setDays] = useState<number>(30);
  const [limit, setLimit] = useState<number>(200);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/analytics/triggers?days=${encodeURIComponent(String(days))}&limit=${encodeURIComponent(String(limit))}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to load trigger analytics");

      const items: any[] = Array.isArray(j?.items) ? j.items : [];
      const mapped: Row[] = items.map((it: any) => {
        const meta = it.meta || {};
        return {
          when: it.created_at || it.when || new Date().toISOString(),
          trigger: it.trigger || it.trigger_code || meta.trigger_code || "-",
          type: it.type || it.trigger_type || meta.trigger_type || "-",
          why: it.why || it.reason || meta.reason || "",
          page: it.page || meta.page || "",
          locale: it.locale || meta.locale || "",
        };
      });
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [days, limit]);

  async function emitTest() {
    try {
      const r = await fetch("/api/analytics/test-trigger", { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Emit failed");
      await load();
      alert("Test trigger event emitted.");
    } catch (e: any) {
      alert(e?.message || "Failed to emit test trigger");
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-4">
      <h1 className="text-xl font-semibold">Analytics · Trigger events</h1>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Days</label>
        <select
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {[1,7,14,30,60,90].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <label className="text-sm ms-2">Limit</label>
        <select
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          {[50,100,200,500].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>

        <button
          onClick={load}
          className="ms-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          Refresh
        </button>

        <button
          onClick={emitTest}
          className="ms-auto px-3 py-1 rounded bg-amber-500 text-black border border-amber-400 hover:bg-amber-400"
        >
          Emit test trigger
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-800 bg-red-950/50 p-2 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="text-left p-2">When</th>
              <th className="text-left p-2">Trigger</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Why</th>
              <th className="text-left p-2">Page</th>
              <th className="text-left p-2">Locale</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-3 opacity-70">Loading...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="p-3 opacity-70">No trigger events yet.</td></tr>
            )}
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t border-slate-800">
                <td className="p-2">{new Date(r.when).toLocaleString()}</td>
                <td className="p-2">{r.trigger}</td>
                <td className="p-2">{r.type}</td>
                <td className="p-2">{r.why}</td>
                <td className="p-2">{r.page}</td>
                <td className="p-2">{r.locale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}