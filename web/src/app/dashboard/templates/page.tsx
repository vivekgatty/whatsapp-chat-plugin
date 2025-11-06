"use client";

import { useEffect, useMemo, useState } from "react";

type Template = {
  id: string;
  business_id: string;
  locale: "en" | "hi" | "kn" | "ta";
  kind: "greeting" | "off_hours" | "fallback";
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
};

const LOCALES = ["en","hi","kn","ta"] as const;
const KINDS = ["greeting","off_hours","fallback"] as const;

export default function TemplatesPage() {
  const [wid, setWid] = useState<string>("");
  const [locale, setLocale] = useState<Template["locale"]>("en");
  const [kind, setKind] = useState<Template["kind"]>("greeting");
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [editing, setEditing] = useState<Template | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const u = new URL(window.location.href);
    const w = u.searchParams.get("wid") || "";
    if (w) setWid(w);
  }, []);

  const qs = useMemo(() => {
    const sp = new URLSearchParams();
    if (wid) sp.set("wid", wid);
    sp.set("locale", locale);
    sp.set("kind", kind);
    return sp.toString();
  }, [wid, locale, kind]);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`/api/templates?${qs}`, { cache: "no-store" });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Failed");
      setItems(j.templates || []);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [qs]); // reload on filters

  function startNew() {
    setEditing(null);
    setName("");
    setBody("");
  }

  function startEdit(t: Template) {
    setEditing(t);
    setName(t.name);
    setBody(t.body);
    if (t.locale !== locale) setLocale(t.locale);
    if (t.kind !== kind) setKind(t.kind);
  }

  async function save() {
    setErr(null);
    try {
      const sp = new URLSearchParams();
      if (wid) sp.set("wid", wid);

      if (editing) {
        const r = await fetch(`/api/templates/${editing.id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale, kind, name, body }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || "Update failed");
      } else {
        const r = await fetch(`/api/templates?${sp.toString()}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale, kind, name, body }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || "Create failed");
      }

      startNew();
      await load();
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    setErr(null);
    try {
      const r = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Delete failed");
      await load();
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Templates</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          placeholder="Widget ID (optional)"
          value={wid}
          onChange={(e) => setWid(e.target.value)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        <select value={locale} onChange={(e)=>setLocale(e.target.value as any)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
          {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={kind} onChange={(e)=>setKind(e.target.value as any)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
          {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={load} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Refresh</button>
        <button onClick={startNew} className="rounded bg-sky-600 px-3 py-2 text-sm hover:bg-sky-500">New</button>
      </div>

      {err && <div className="mb-4 rounded border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{err}</div>}

      {/* Form */}
      <div className="mb-8 rounded border border-slate-700 p-4">
        <div className="mb-2 text-sm">{editing ? "Edit template" : "New template"}</div>
        <div className="mb-3">
          <input
            placeholder="Name (internal)"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          />
        </div>
        <div className="mb-3">
          <textarea
            placeholder="Message body"
            value={body}
            onChange={(e)=>setBody(e.target.value)}
            className="h-28 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="rounded bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500">
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button onClick={startNew} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Cancel</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="rounded border border-slate-700">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-700 px-3 py-2 text-xs text-slate-400">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Locale</div>
          <div className="col-span-2">Kind</div>
          <div className="col-span-4">Body</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {loading ? (
          <div className="px-3 py-3 text-sm text-slate-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-3 py-3 text-sm text-slate-400">No templates yet.</div>
        ) : (
          items.map(t => (
            <div key={t.id} className="grid grid-cols-12 gap-2 border-t border-slate-800 px-3 py-2 text-sm">
              <div className="col-span-3">{t.name}</div>
              <div className="col-span-2">{t.locale}</div>
              <div className="col-span-2">{t.kind}</div>
              <div className="col-span-4 truncate" title={t.body}>{t.body}</div>
              <div className="col-span-1 text-right">
                <button onClick={()=>startEdit(t)} className="mr-2 underline">Edit</button>
                <button onClick={()=>remove(t.id)} className="text-red-300 underline">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
