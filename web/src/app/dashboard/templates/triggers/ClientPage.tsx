"use client";

import { useEffect, useMemo, useState } from "react";
import * as CT from "../../../../lib/customTriggers";

type TriggerRow = {
  id: string;
  code: string;
  label: string;
  type: string;
  active: boolean;
  matchers: any;
  created_at?: string;
  updated_at?: string;
};

const FALLBACK_TYPES = ["manual", "url_param", "utm", "path_match"] as const;

function getAllowedTypes(): string[] {
  const m: any = CT as any;
  if (Array.isArray(m?.ALLOWED_TRIGGER_TYPES) && m.ALLOWED_TRIGGER_TYPES.length > 0) {
    return m.ALLOWED_TRIGGER_TYPES as string[];
  }
  return Array.from(FALLBACK_TYPES);
}

const SAMPLE_BY_TYPE: Record<string, any> = {
  manual:     { via: "intent_param_or_widget_setting" },
  url_param:  { key: "intent", value: "offers" },
  utm:        { campaign: "diwali2025", source: "google" },
  path_match: { regex: "^/product/.+" },
};

export default function ClientPage() {
  const allowedTypes = useMemo(() => getAllowedTypes(), []);
  const [rows, setRows] = useState<TriggerRow[] | null>(null);
  const [canWrite, setCanWrite] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  // create form
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<string>(allowedTypes[0] || "manual");
  const [matchers, setMatchers] = useState<string>(JSON.stringify(SAMPLE_BY_TYPE[allowedTypes[0] || "manual"], null, 2));
  const [active, setActive] = useState(true);

  useEffect(() => {
    // set sample when type changes
    setMatchers(JSON.stringify(SAMPLE_BY_TYPE[type] || {}, null, 2));
  }, [type]);

  async function loadList() {
    setRows(null);
    setErr("");
    try {
      const r = await fetch("/api/triggers?active=0", { cache: "no-store" });
      const j = await r.json();
      if (j && j.can_write === false) setCanWrite(false); else setCanWrite(true);
      const items: TriggerRow[] = Array.isArray(j?.items) ? j.items : [];
      setRows(items);
    } catch (e: any) {
      setErr(e?.message || "Failed to load triggers");
      setRows([]);
    }
  }

  useEffect(() => { loadList(); }, []);

  async function createTrigger() {
    setErr("");
    let parsed: any = {};
    try { parsed = matchers ? JSON.parse(matchers) : {}; } catch {
      setErr("Matchers must be valid JSON."); return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, label, type, matchers: parsed, active })
      });
      const j = await r.json();
      if (!r.ok) { setErr(j?.error || "Create failed"); }
      else {
        // reset
        setCode(""); setLabel("");
        setType(allowedTypes[0] || "manual");
        setMatchers(JSON.stringify(SAMPLE_BY_TYPE[allowedTypes[0] || "manual"], null, 2));
        setActive(true);
        await loadList();
      }
    } finally { setBusy(false); }
  }

  function collectPatch(tr: HTMLTableRowElement): any {
    const patch: any = {};
    const inputs = tr.querySelectorAll<HTMLElement>("[data-k]");
    inputs.forEach((el) => {
      const k = el.getAttribute("data-k");
      if (!k) return;
      if ((el as HTMLInputElement).type === "checkbox") {
        (patch as any)[k] = (el as HTMLInputElement).checked;
      } else if (k === "matchers") {
        try {
          (patch as any)[k] = JSON.parse((el as HTMLTextAreaElement).value || "{}");
        } catch {
          (patch as any).__matchers_error = true;
        }
      } else {
        (patch as any)[k] = (el as HTMLInputElement).value;
      }
    });
    return patch;
  }

  async function onRowAction(e: React.MouseEvent) {
    const btn = (e.target as HTMLElement).closest("button[data-act]") as HTMLButtonElement | null;
    if (!btn) return;
    const tr = (e.target as HTMLElement).closest("tr[data-id]") as HTMLTableRowElement | null;
    if (!tr) return;
    const id = tr.getAttribute("data-id") || "";

    const act = btn.getAttribute("data-act");
    if (act === "save") {
      const patch = collectPatch(tr);
      if (patch.__matchers_error) { setErr("Matchers must be valid JSON."); return; }
      setBusy(true); setErr("");
      try {
        const r = await fetch(`/api/triggers/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        });
        const j = await r.json();
        if (!r.ok) { setErr(j?.error || "Update failed"); }
        else { await loadList(); }
      } finally { setBusy(false); }
    } else if (act === "del") {
      if (!confirm("Delete this trigger?")) return;
      setBusy(true); setErr("");
      try {
        const r = await fetch(`/api/triggers/${id}`, { method: "DELETE" });
        const j = await r.json();
        if (!r.ok) { setErr(j?.error || "Delete failed"); }
        else { await loadList(); }
      } finally { setBusy(false); }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Custom Triggers</h1>
        <div className="text-sm opacity-70">Attach rules to auto-reply templates</div>
      </div>

      {!canWrite && (
        <div className="rounded border border-amber-400/50 bg-amber-500/10 text-amber-200 p-3">
          <b>Pro required:</b> Custom triggers need an active ₹199/month subscription.
          <a className="underline ms-2" href="/dashboard/billing">Upgrade now</a>
        </div>
      )}

      <div className="rounded border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Code (unique)</label>
            <input
              value={code}
              onChange={(e)=>setCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="e.g., diwali_sale" />
            <div className="text-xs opacity-60 mt-1">3–30 chars: a-z, 0–9, _</div>
          </div>
          <div>
            <label className="block text-sm mb-1">Label</label>
            <input
              value={label}
              onChange={(e)=>setLabel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="Diwali Sale campaign" />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              value={type}
              onChange={(e)=>setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1">
              {allowedTypes.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Matchers (JSON)</label>
          <textarea
            value={matchers}
            onChange={(e)=>setMatchers(e.target.value)}
            className="w-full min-h-[110px] bg-slate-950 border border-slate-700 rounded px-2 py-1"
            placeholder='{ "key": "intent", "value": "offers" }' />
          <div className="text-xs opacity-60 mt-1">Example changes with type.</div>
        </div>

        <div className="flex items-center gap-2">
          <input id="ct_active" type="checkbox" checked={active} onChange={(e)=>setActive(e.target.checked)} className="accent-emerald-500" />
          <label htmlFor="ct_active">Active</label>
          <button
            onClick={createTrigger}
            disabled={!canWrite || busy}
            className="ms-auto px-3 py-1 rounded bg-emerald-500 text-black border border-emerald-400 hover:bg-emerald-400 disabled:opacity-60">
            {busy ? "Saving..." : "Create Trigger"}
          </button>
        </div>

        {!!err && <div className="text-red-400 text-sm">{err}</div>}
      </div>

      <div className="rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-sm" onClick={onRowAction}>
          <thead className="bg-slate-900/60">
            <tr>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Label</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Matchers</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <tr><td colSpan={6} className="p-3 opacity-70">Loading...</td></tr>
            )}
            {rows !== null && rows.length === 0 && (
              <tr><td colSpan={6} className="p-3 opacity-70">No custom triggers yet.</td></tr>
            )}
            {rows?.map((it) => (
              <tr key={it.id} data-id={it.id} className="border-t border-slate-800 align-top">
                <td className="p-2 text-xs font-mono">{it.code}</td>
                <td className="p-2">
                  <input defaultValue={it.label} data-k="label" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1" />
                </td>
                <td className="p-2">
                  <select defaultValue={it.type} data-k="type" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1">
                    {allowedTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </td>
                <td className="p-2">
                  <input type="checkbox" defaultChecked={it.active} data-k="active" />
                </td>
                <td className="p-2 w-[45%]">
                  <textarea defaultValue={JSON.stringify(it.matchers || {}, null, 2)} data-k="matchers" className="w-full min-h-[90px] bg-slate-950 border border-slate-700 rounded px-2 py-1" />
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button data-act="save" className="px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700" disabled={busy || !canWrite}>Save</button>
                    <button data-act="del" className="px-3 py-1 rounded bg-red-500/80 text-black border border-red-400 hover:bg-red-400" disabled={busy || !canWrite}>Delete</button>
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