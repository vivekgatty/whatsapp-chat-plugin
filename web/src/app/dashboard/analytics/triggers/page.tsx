"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Row = {
  when: string;
  trigger: string;
  type: string;
  why: string;
  page: string;
  locale: string;
};

export default function TriggerAnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [limit, setLimit] = useState<number>(200);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const qs = useMemo(() => {
    const q = new URLSearchParams();
    q.set("days", String(days));
    q.set("limit", String(limit));
    return q.toString();
  }, [days, limit]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: This must match the server route we created earlier.
      const res = await fetch(`/api/analytics/triggers/list?${qs}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`List failed: ${res.status} ${text}`);
      }
      const data = await res.json();
      // Be tolerant to either {items} or {data}
      const items: Row[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setRows(items);
    } catch (e: any) {
      alert(e?.message || "Failed to load trigger analytics");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => {
    load();
  }, [load]);

  const emitTest = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/test-trigger", {
        method: "POST",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Emit failed: ${res.status} ${text}`);
      }
      alert("Test trigger event emitted.");
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to emit test trigger");
    }
  }, [load]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Analytics · Trigger events</h1>

      <div className="flex items-center gap-3">
        <label className="text-sm">
          Days{" "}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
          >
            {[7, 14, 30, 60, 90].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Limit{" "}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
          >
            {[50, 100, 200, 500, 1000].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <button
          className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded px-3 py-1 text-sm"
          onClick={load}
        >
          Refresh
        </button>

        <button
          className="bg-amber-600 hover:bg-amber-500 rounded px-3 py-1 text-sm"
          onClick={emitTest}
        >
          Emit test trigger
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-700">
              <th className="py-2 px-3">When</th>
              <th className="py-2 px-3">Trigger</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Why</th>
              <th className="py-2 px-3">Page</th>
              <th className="py-2 px-3">Locale</th>
            </tr>
          </thead>
          <tbody>
            {rows === null || loading ? (
              <tr>
                <td className="py-3 px-3 text-neutral-400" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="py-3 px-3 text-neutral-400" colSpan={6}>
                  No trigger events yet.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-t border-neutral-800">
                  <td className="py-2 px-3">
                    {new Date(r.when).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">{r.trigger}</td>
                  <td className="py-2 px-3">{r.type}</td>
                  <td className="py-2 px-3">{r.why}</td>
                  <td className="py-2 px-3">{r.page}</td>
                  <td className="py-2 px-3">{r.locale}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}