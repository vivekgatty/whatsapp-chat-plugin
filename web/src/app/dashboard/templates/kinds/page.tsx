"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Kind = { id: string; key: string; label: string; widget_id: string | null };

export default function TemplateKindsPage() {
  const [wid, setWid] = useState<string>("");
  const [rows, setRows] = useState<Kind[]>([]);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const q = wid ? `?wid=${encodeURIComponent(wid)}` : "";
    const r = await fetch(`/api/template-kinds${q}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!j?.ok) setErr(j?.error || "Failed to load kinds");
    setRows(j?.kinds || []);
  }

  useEffect(() => {
    const u = new URL(window.location.href);
    const w = u.searchParams.get("wid");
    if (w) setWid(w);
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wid]);

  async function createKind() {
    if (!key.trim() || !label.trim()) return;
    setBusy(true);
    const r = await fetch(`/api/template-kinds`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wid: wid || null, key: key.trim(), label: label.trim() }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!j?.ok) return setErr(j?.error || "Failed to create");
    setKey("");
    setLabel("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this kind?")) return;
    const r = await fetch(`/api/template-kinds/${id}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    if (!j?.ok) setErr(j?.error || "Failed to delete");
    load();
  }

  const heading = useMemo(() => (wid ? "Custom template kinds (this widget)" : "Custom template kinds"), [wid]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{heading}</h1>
        <Link href={`/dashboard/templates${wid ? `?wid=${encodeURIComponent(wid)}` : ""}`} className="text-sm underline">
          ← Back to Templates
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <input
          placeholder="Widget ID filter (optional)"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          value={wid}
          onChange={(e) => setWid(e.target.value)}
        />
        <input
          placeholder="key (e.g., promo, upsell)"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            placeholder="Label (e.g., Promo)"
            className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button
            onClick={createKind}
            disabled={busy || !key.trim() || !label.trim()}
            className="rounded bg-sky-600 px-3 py-2 text-sm hover:bg-sky-500 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      {err && <div className="mb-4 text-sm text-rose-400">{err}</div>}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-left">
            <th className="py-2 pr-3">Label</th>
            <th className="py-2 pr-3">Key</th>
            <th className="py-2 pr-3">Widget</th>
            <th className="py-2 pr-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-slate-400">
                No custom kinds yet.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-800">
                <td className="py-2 pr-3">{r.label}</td>
                <td className="py-2 pr-3">{r.key}</td>
                <td className="py-2 pr-3">{r.widget_id || <em className="text-slate-400">all</em>}</td>
                <td className="py-2 pr-3">
                  <button onClick={() => remove(r.id)} className="text-rose-400 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
