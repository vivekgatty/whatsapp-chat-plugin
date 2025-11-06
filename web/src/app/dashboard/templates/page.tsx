"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TemplateRow = { id: string; name: string; locale: string; kind: string; body: string };
type Kind = { key: string; label: string };

const SYSTEM_KINDS: Kind[] = [
  { key: "greeting",   label: "Greeting (system)" },
  { key: "support",    label: "Support (system)" },
  { key: "sales",      label: "Sales (system)" },
  { key: "off_hours",  label: "Off-hours (system)" },
  { key: "holiday",    label: "Holiday (system)" },
  { key: "follow_up",  label: "Follow-up (system)" },
];

const LOCALES = ["en", "hi", "kn", "ta"] as const;

export default function TemplatesPage() {
  const [wid, setWid] = useState("");
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("en");
  const [kind, setKind] = useState("greeting");

  // custom kinds loaded from API
  const [customKinds, setCustomKinds] = useState<Kind[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const kinds = useMemo<Kind[]>(
    () => [...SYSTEM_KINDS, ...customKinds],
    [customKinds]
  );

  useEffect(() => {
    // pick wid from URL if present
    const u = new URL(window.location.href);
    const w = u.searchParams.get("wid");
    if (w) setWid(w);
  }, []);

  useEffect(() => {
    void loadKinds();
  }, [wid]);

  async function loadKinds() {
    try {
      const q = wid ? `?wid=${encodeURIComponent(wid)}` : "";
      const r = await fetch(`/api/template-kinds${q}`, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (j?.ok) {
        const list = (j.kinds as any[]).map((k) => ({ key: k.key, label: k.label }));
        setCustomKinds(list);
      } else {
        setCustomKinds([]);
      }
    } catch {
      setCustomKinds([]);
    }
  }

  async function load() {
    setErr(null);
    const params = new URLSearchParams();
    if (wid) params.set("wid", wid);
    if (locale) params.set("locale", locale);
    if (kind) params.set("kind", kind);
    const r = await fetch(`/api/templates?${params.toString()}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!j?.ok) setErr(j?.error || "Failed to load templates");
    setRows(Array.isArray(j?.templates) ? j.templates : []);
  }

  useEffect(() => { void load(); }, [wid, locale, kind]);

  async function create() {
    if (!name.trim() || !body.trim()) return;
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/templates`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        wid: wid || null,
        name: name.trim(),
        locale,
        kind,
        body,
      }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!j?.ok) return setErr(j?.error || "Failed to create");
    setName("");
    setBody("");
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Templates</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Widget ID (optional)"
          value={wid}
          onChange={(e) => setWid(e.target.value)}
        />

        <select
          className="rounded border border-slate-700 bg-slate-900 px-2 py-2"
          value={locale}
          onChange={(e) => setLocale(e.target.value as any)}
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          className="rounded border border-slate-700 bg-slate-900 px-2 py-2"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {kinds.map((k) => (
            <option key={`${k.key}`} value={k.key}>
              {k.label}
            </option>
          ))}
        </select>

        <button
          onClick={load}
          className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
        >
          Refresh
        </button>

        <Link
          href={`/dashboard/templates/kinds${wid ? `?wid=${encodeURIComponent(wid)}` : ""}`}
          className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
        >
          Manage kinds
        </Link>

        <button
          onClick={() => {
            setName("");
            setBody("");
            const n = document.getElementById("new-template") as HTMLDivElement | null;
            if (n) n.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="rounded bg-sky-600 px-3 py-2 text-sm hover:bg-sky-500"
        >
          New
        </button>
      </div>

      {err && <div className="mb-4 text-sm text-rose-400">{err}</div>}

      {/* New template */}
      <div id="new-template" className="mb-6 rounded border border-slate-700 p-4">
        <div className="mb-2 text-sm font-medium">New template</div>
        <input
          className="mb-2 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Name (internal)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="h-28 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Message body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="mt-2">
          <button
            disabled={busy || !name.trim() || !body.trim()}
            onClick={create}
            className="rounded bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      {/* List */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-left">
            <th className="py-2 pr-3">Name</th>
            <th className="py-2 pr-3">Locale</th>
            <th className="py-2 pr-3">Kind</th>
            <th className="py-2 pr-3">Body</th>
            <th className="py-2 pr-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-slate-400">
                No templates yet.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-800">
                <td className="py-2 pr-3">{r.name}</td>
                <td className="py-2 pr-3">{r.locale}</td>
                <td className="py-2 pr-3">{r.kind}</td>
                <td className="max-w-[520px] truncate py-2 pr-3">{r.body}</td>
                <td className="py-2 pr-3">
                  {/* keep simple for now; edit can come later */}
                  <span className="text-slate-500">—</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
