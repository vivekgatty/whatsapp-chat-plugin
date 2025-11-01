'use client';
import React from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

type Day = "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun";
type HoursRow = { open: string; close: string; closed: boolean };
type HoursMap = Record<Day, HoursRow>;
type Biz = {
  name?: string;
  website?: string;
  email?: string;
  country?: string;
  dialCode?: string;
  phone?: string;
  hours?: Partial<HoursMap> | HoursMap;
};

const DAYS: { key: Day; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

function defaultHours(): HoursMap {
  const base: HoursRow = { open: "09:00", close: "18:00", closed: false };
  return { mon:{...base}, tue:{...base}, wed:{...base}, thu:{...base}, fri:{...base}, sat:{...base}, sun:{...base, closed:true} };
}

function buildCountryData() {
  const dn = typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : undefined;
  const countries = getCountries()
    .map(code => ({ code, name: (dn?.of(code) as string) || code, dial: "+" + getCountryCallingCode(code) }))
    .sort((a,b) => a.name.localeCompare(b.name));

  const dialMap = new Map<string, string[]>(); // dial -> [country names]
  for (const c of countries) {
    const arr = dialMap.get(c.dial) ?? [];
    arr.push(c.name);
    dialMap.set(c.dial, arr);
  }
  const dials = Array.from(dialMap.entries())
    .map(([dial, names]) => ({ dial, label: `${dial} - ${names[0]}${names.length>1 ? ` (+${names.length-1} more)` : ""}` }))
    .sort((a,b) => parseInt(a.dial.slice(1)) - parseInt(b.dial.slice(1)));

  return { countries, dials };
}

export default function Page(){
  const data = React.useMemo(buildCountryData, []);
  const [biz, setBiz] = React.useState<Biz>({
    name: "",
    website: "https://chatmadi.com",
    email: "admin@chatmadi.com",
    country: "IN",
    dialCode: "+91",
    phone: "9591428002",
    hours: defaultHours(),
  });

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving]   = React.useState(false);
  const [msg, setMsg]         = React.useState<string | undefined>();

  React.useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await fetch('/api/business/overview', {
  method: 'POST',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(biz)
});
const j = await r.json().catch(() => null);
setMsg(r.ok ? 'Saved' : ('Could not save: ' + (j?.error ?? (r.status + ' ' + r.statusText))));
    try {
      const r = await fetch('/api/business/overview', {
  method: 'POST',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(biz)
});
const j = await r.json().catch(() => null);
setMsg(r.ok ? 'Saved' : ('Could not save: ' + (j?.error ?? (r.status + ' ' + r.statusText))));
    } catch {
      setMsg("Could not save right now.");
    } finally {
      setSaving(false);
    }
  }

  const onCountryChange = (code: string) => {
    onField("country", code);
    const match = data.countries.find(c => c.code === code);
    if (match) onField("dialCode", match.dial);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit business profile</h1>

      {loading ? <div className="text-slate-300">Loading...</div> : (
        <form onSubmit={save} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Business name</label>
              <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                value={biz.name ?? ""} onChange={e=>onField("name", e.target.value)} placeholder="Your company" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Website</label>
              <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                value={biz.website ?? ""} onChange={e=>onField("website", e.target.value)} placeholder="https://example.com" pattern="https?://.+" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                value={biz.email ?? ""} onChange={e=>onField("email", e.target.value)} placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Country</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                value={biz.country ?? "IN"} onChange={e => onCountryChange(e.target.value)}>
                {data.countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-3 md:col-span-2">
              <div>
                <label className="block text-sm mb-1">Dial code</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                  value={biz.dialCode ?? "+91"}
                  onChange={e => onField("dialCode", e.target.value)}>
                  {data.dials.map(d => <option key={d.dial} value={d.dial}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Phone number</label>
                <input type="tel" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                  value={biz.phone ?? ""} onChange={e=>onField("phone", e.target.value)} placeholder="9740333189" required />
              </div>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2">Working hours</div>
            <div className="grid grid-cols-1 gap-2">
              {DAYS.map(({key,label}) => {
                const hx = (biz.hours && Object.keys(biz.hours as any).length ? biz.hours : defaultHours()) as HoursMap;
                const row = (hx as any)[key] ?? { open:"09:00", close:"18:00", closed:false };
                return (
                  <div key={key} className="grid grid-cols-[60px_120px_24px_120px_auto] items-center gap-3">
                    <div className="text-sm text-slate-300">{label}</div>
                    <input type="time" className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
                      value={row.open} onChange={e=>setHour(key,"open", e.target.value)} disabled={row.closed} required={!row.closed}/>
                    <span className="text-center opacity-70">to</span>
                    <input type="time" className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
                      value={row.close} onChange={e=>setHour(key,"close", e.target.value)} disabled={row.closed} required={!row.closed}/>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={row.closed} onChange={e=>setHour(key,"closed", e.target.checked)} />
                      Closed
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 rounded px-4 py-2 disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
            <a href="/dashboard" className="text-sky-400 hover:underline">Back to dashboard</a>
          </div>

          {msg && <div className="text-sm text-slate-300">{msg}</div>}
        </form>
      )}
    </div>
  );
}