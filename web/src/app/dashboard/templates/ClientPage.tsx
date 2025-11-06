"use client";

import { useEffect, useMemo, useState } from "react";
import { TRIGGERS, TRIGGER_INFO, type TriggerCode } from "../../../lib/triggers";

type Template = {
  id: string;
  business_id: string;
  name: string;
  locale: string;
  trigger: TriggerCode | string;
  message: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

const LOCALES = ["en", "hi", "kn", "ta"] as const;

export default function ClientPage() {
  const [locale, setLocale] = useState<string>("en");
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [form, setForm] = useState<Partial<Template>>({
    name: "",
    locale: "en",
    trigger: "default",
    message: "",
    active: true,
  });

  async function loadList() {
    setLoading(true);
    try {
      const r = await fetch(`/api/templates?locale=${encodeURIComponent(locale)}`, { cache: "no-store" });
      const j = await r.json();
      setItems(Array.isArray(j?.items) ? j.items : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadList(); }, [locale]);

  async function createTemplate() {
    if (!form.message?.trim()) { alert("Message cannot be empty"); return; }
    const body = {
      name: (form.name || "").trim() || "New Template",
      locale: form.locale || locale,
      trigger: (form.trigger as string) || "default",
      message: form.message || "",
      active: !!form.active,
    };
    setCreating(true);
    try {
      const r = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) { alert(j?.error || "Create failed"); return; }
      setForm({ name: "", locale, trigger: "default", message: "", active: true });
      loadList();
    } finally {
      setCreating(false);
    }
  }

  async function updateTemplate(id: string, patch: Partial<Template>) {
    const r = await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await r.json();
    if (!r.ok) alert(j?.error || "Update failed");
    else loadList();
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    const r = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    const j = await r.json();
    if (!r.ok) alert(j?.error || "Delete failed");
    else loadList();
  }

  const hasItems = useMemo(() => items && items.length > 0, [items]);
  const triggerHelp = (t: string) => TRIGGER_INFO[t as TriggerCode] || "";

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Auto-reply templates</h1>
        <div className="ms-auto flex items-center gap-2">
          <label className="text-sm opacity-80">Locale</label>
          <select
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
            value={locale}
            onChange={(e) => {
              const v = e.target.value;
              setLocale(v);
              setForm((f) => ({ ...f, locale: v }));
            }}
          >
            {LOCALES.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        </div>
      </div>

      {/* Create */}
      <div className="rounded border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"
              value={form.name || ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Trigger</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"
              value={(form.trigger as string) || "default"}
              onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value as any }))}
            >
              {TRIGGERS.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
            <div className="text-xs opacity-70 mt-1">{triggerHelp((form.trigger as string) || "default")}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            className="w-full min-h-[100px] bg-slate-950 border border-slate-700 rounded px-2 py-1"
            value={form.message || ""}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
          <div className="text-[11px] opacity-60 mt-1">
            Tips: You can use placeholders like {"{utm_campaign}"}, {"{page_title}"}, {"{next_open}"}; we will fill them when the trigger fires.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={!!form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          <label htmlFor="active">Active</label>
          <button
            onClick={createTemplate}
            disabled={creating}
            className="ms-auto px-3 py-1 rounded bg-amber-500 text-black border border-amber-400 hover:bg-amber-400 disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Locale</th>
              <th className="text-left p-2">Trigger</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Message</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!hasItems && (
              <tr><td colSpan={6} className="p-3 opacity-70">{loading ? "Loading..." : "No templates yet."}</td></tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-t border-slate-800 align-top">
                <td className="p-2">
                  <input
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"
                    defaultValue={it.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== it.name) updateTemplate(it.id, { name: v || "Untitled" });
                    }}
                  />
                </td>
                <td className="p-2">
                  <select
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1"
                    defaultValue={it.locale}
                    onChange={(e) => updateTemplate(it.id, { locale: e.target.value })}
                  >
                    {LOCALES.map((l) => (<option key={l} value={l}>{l}</option>))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1"
                    defaultValue={it.trigger as string}
                    onChange={(e) => updateTemplate(it.id, { trigger: e.target.value })}
                  >
                    {TRIGGERS.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  <div className="text-[11px] opacity-60 mt-1">{triggerHelp(it.trigger as string)}</div>
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    defaultChecked={it.active}
                    onChange={(e) => updateTemplate(it.id, { active: e.target.checked })}
                  />
                </td>
                <td className="p-2 w-[45%]">
                  <textarea
                    className="w-full min-h-[80px] bg-slate-950 border border-slate-700 rounded px-2 py-1"
                    defaultValue={it.message}
                    onBlur={(e) => {
                      if (e.target.value !== it.message) {
                        updateTemplate(it.id, { message: e.target.value });
                      }
                    }}
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => deleteTemplate(it.id)}
                    className="px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
                  >
                    Delete
                  </button>
                  <div className="text-[11px] opacity-60 mt-2">
                    {new Date(it.updated_at).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}