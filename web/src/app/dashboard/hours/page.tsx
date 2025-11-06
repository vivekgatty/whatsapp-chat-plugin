"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DayCfg = { closed?: boolean; open?: string; close?: string };
type Hours = {
  mon: DayCfg; tue: DayCfg; wed: DayCfg; thu: DayCfg; fri: DayCfg; sat: DayCfg; sun: DayCfg;
};

const DOW: Array<keyof Hours> = ["mon","tue","wed","thu","fri","sat","sun"];
const LABEL: Record<keyof Hours,string> = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };

export default function HoursPage() {
  const [wid, setWid] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [hours, setHours] = useState<Hours>({
    mon:{open:"09:30",close:"18:30",closed:false},
    tue:{open:"09:30",close:"18:30",closed:false},
    wed:{open:"09:30",close:"18:30",closed:false},
    thu:{open:"09:30",close:"18:30",closed:false},
    fri:{open:"09:30",close:"18:30",closed:false},
    sat:{open:"10:00",close:"16:00",closed:false},
    sun:{closed:true}
  });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const u = new URL(window.location.href);
    const w = u.searchParams.get("wid");
    if (w) setWid(w);
  }, []);

  async function load() {
    setErr(null);
    const q = wid ? `?wid=${encodeURIComponent(wid)}` : "";
    const r = await fetch(`/api/business/hours${q}`, { cache:"no-store" });
    const j = await r.json().catch(() => ({}));
    if (!j?.ok) { setErr(j?.error || "Failed to load"); return; }
    setTimezone(j.timezone || "Asia/Kolkata");
    setHours(j.hours);
  }

  async function save() {
    setErr(null);
    const r = await fetch(`/api/business/hours`, {
      method:"POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ wid: wid || null, timezone, hours })
    });
    const j = await r.json().catch(() => ({}));
    if (!j?.ok) { setErr(j?.error || "Failed to save"); return; }
    setOk("Saved!");
    setTimeout(()=>setOk(null), 1500);
  }

  useEffect(()=>{ void load(); }, [wid]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Business Hours</h1>
        <Link href={`/dashboard${wid ? `?wid=${encodeURIComponent(wid)}` : ""}`} className="text-sm underline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Widget ID (optional)"
          value={wid}
          onChange={(e)=>setWid(e.target.value)}
        />
        <input
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Timezone (e.g., Asia/Kolkata, Europe/London)"
          value={timezone}
          onChange={(e)=>setTimezone(e.target.value)}
        />
        <button onClick={load} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Reload</button>
      </div>

      {err && <div className="mb-3 text-sm text-rose-400">{err}</div>}
      {ok &&  <div className="mb-3 text-sm text-emerald-400">{ok}</div>}

      <div className="rounded border border-slate-700 p-4">
        {DOW.map((d)=>(
          <div key={d} className="mb-3 grid grid-cols-12 items-center gap-2">
            <div className="col-span-2">{LABEL[d]}</div>
            <label className="col-span-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!hours[d]?.closed}
                onChange={(e)=>{
                  const v = e.target.checked;
                  setHours((h)=>({ ...h, [d]: { ...(h[d]||{}), closed: v } }));
                }}
              />
              Closed
            </label>
            <input
              className="col-span-3 rounded border border-slate-700 bg-slate-900 px-3 py-2"
              placeholder="Open (HH:MM)"
              value={hours[d]?.open || ""}
              onChange={(e)=>setHours((h)=>({ ...h, [d]: { ...(h[d]||{}), open:e.target.value } }))}
              disabled={!!hours[d]?.closed}
            />
            <input
              className="col-span-3 rounded border border-slate-700 bg-slate-900 px-3 py-2"
              placeholder="Close (HH:MM)"
              value={hours[d]?.close || ""}
              onChange={(e)=>setHours((h)=>({ ...h, [d]: { ...(h[d]||{}), close:e.target.value } }))}
              disabled={!!hours[d]?.closed}
            />
          </div>
        ))}
        <div className="mt-4">
          <button onClick={save} className="rounded bg-sky-600 px-4 py-2 text-sm hover:bg-sky-500">Save hours</button>
        </div>
      </div>
    </div>
  );
}
