"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  created_at: string;
  event: string;
  page: string | null;
  meta: any;
  widget_id: string | null;
  business_id: string | null;
};

function safeMeta(x: any): any {
  try {
    if (x && typeof x === "string") return JSON.parse(x);
    return x ?? {};
  } catch {
    return {};
  }
}

function reasonText(meta: any): string {
  const m = safeMeta(meta);
  const reason =
    m.reason || m.via || m.source || m.match || m.trigger_reason || "â€”";
  const value =
    m.value ||
    m.intent ||
    m.campaign ||
    m.utm_campaign ||
    m.utm_source ||
    m.slug ||
    "";
  return value ? `${reason}: ${value}` : String(reason);
}

function triggerCode(meta: any): string {
  const m = safeMeta(meta);
  return m.trigger_code || m.trigger || m.code || "â€”";
}

function triggerType(meta: any): string {
  const m = safeMeta(meta);
  return m.trigger_type || m.type || "â€”";
}

function metaLocale(meta: any): string {
  const m = safeMeta(meta);
  return m.locale || m.lang || "â€”";
}

export default function Page() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [days, setDays] = useState<number>(30);
  const [limit, setLimit] = useState<number>(200);
  const [error, setError] = useState<string>("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(
        `/api/analytics/triggers?days=${encodeURIComponent(String(days))}&limit=${encodeURIComponent(String(limit))}`,
        { cache: "no-store" }
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to load trigger events");
      setItems(Array.isArray(j?.items) ? j.items : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* on mount */ }, []);
  useEffect(() => { /* reload when filters change */ load(); }, [days, limit]);

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
      };

      const r = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Emit failed");

      await load();
      alert("Test trigger event emitted.");
    } catch (e: any) {
      alert(e?.message || "Failed to emit test trigger");
    }
  }

  const hasRows = useMemo(() => items && items.length > 0, [items]);

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Analytics Â· Trigger events</h1>

        <div className="ms-auto flex items-center gap-2">
          <label className="text-sm opacity-80">Days</label>
          <select
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
          >
            {[7, 14, 30, 60, 90].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label className="text-sm opacity-80 ms-3">Limit</label>
          <select
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
          >
            {[50, 100, 200, 300, 500].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button
            onClick={load}
            disabled={loading}
            className="ms-3 px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "Refreshingâ€¦" : "Refresh"}
          </button>

          <button
            onClick={emitTest}
            className="ms-3 px-3 py-1 rounded bg-amber-500 text-black border border-amber-400 hover:bg-amber-400"
            title="Insert a sample trigger_fired event to verify analytics pipeline"
          >
            Emit test trigger
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-800 bg-red-900/30 text-red-200 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="text-left p-2 w-[16%]">When</th>
              <th className="text-left p-2 w-[15%]">Trigger</th>
              <th className="text-left p-2 w-[10%]">Type</th>
              <th className="text-left p-2 w-[25%]">Why</th>
              <th className="text-left p-2 w-[22%]">Page</th>
              <th className="text-left p-2 w-[12%]">Locale</th>
            </tr>
          </thead>
          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={6} className="p-3 opacity-70">
                  {loading ? "Loadingâ€¦" : "No trigger events yet."}
                </td>
              </tr>
            )}
            {items.map((row) => {
              const meta = safeMeta(row.meta);
              return (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="p-2">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="p-2">{triggerCode(meta)}</td>
                  <td className="p-2">{triggerType(meta)}</td>
                  <td className="p-2">{reasonText(meta)}</td>
                  <td className="p-2">{row.page || meta.referrer || "â€”"}</td>
                  <td className="p-2">{metaLocale(meta)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}