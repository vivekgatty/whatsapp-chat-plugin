"use client";
import * as React from "react";
import { getSupabaseBrowser } from "../../../../lib/supabaseBrowser";

type WorkingDay = { holiday: boolean; from: string; to: string };
type WorkingHours = {
  mon: WorkingDay; tue: WorkingDay; wed: WorkingDay;
  thu: WorkingDay; fri: WorkingDay; sat: WorkingDay; sun: WorkingDay;
};

const DEFAULT_HOURS: WorkingHours = {
  mon: { holiday: false, from: "09:00", to: "18:00" },
  tue: { holiday: false, from: "09:00", to: "18:00" },
  wed: { holiday: false, from: "09:00", to: "18:00" },
  thu: { holiday: false, from: "09:00", to: "18:00" },
  fri: { holiday: false, from: "09:00", to: "18:00" },
  sat: { holiday: false, from: "10:00", to: "14:00" },
  sun: { holiday: true,  from: "09:00", to: "18:00" },
};

const DAY_LABELS: Record<keyof WorkingHours, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

export default function BusinessForm(
  { userId, initial }:{ userId: string; initial: any | null }
) {
  const supabase = getSupabaseBrowser();

  const [name, setName] = React.useState(initial?.name ?? "");
  const [category, setCategory] = React.useState(initial?.category ?? "");
  const [whatsapp, setWhatsapp] = React.useState(initial?.whatsapp_e164 ?? "");
  const [contact, setContact] = React.useState(initial?.contact_name ?? "");
  const [tz, setTz] = React.useState(initial?.timezone ?? "Asia/Kolkata");
  const [hours, setHours] = React.useState<WorkingHours>(
    initial?.working_hours ?? DEFAULT_HOURS
  );
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  function updateDay(day: keyof WorkingHours, patch: Partial<WorkingDay>) {
    setHours(h => ({ ...h, [day]: { ...h[day], ...patch } }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null); setErr(null);

    const payload = {
      owner_user_id: userId,
      name, category,
      whatsapp_e164: whatsapp,
      contact_name: contact,
      timezone: tz,
      working_hours: hours,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("businesses")
      .upsert(payload, { onConflict: "owner_user_id" });

    setSaving(false);
    if (error) { setErr(error.message); return; }
    setMsg("Profile saved.");
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <label className="block">
        <span className="text-sm text-zinc-300">Business / company name</span>
        <input className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"
               value={name} onChange={e=>setName(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-300">Category</span>
        <input className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"
               value={category} onChange={e=>setCategory(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-300">WhatsApp number (E.164)</span>
        <input placeholder="+919876543210"
               className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"
               value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-300">Contact name</span>
        <input className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"
               value={contact} onChange={e=>setContact(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-300">Timezone</span>
        <select className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"
                value={tz} onChange={e=>setTz(e.target.value)}>
          <option>Asia/Kolkata</option>
          <option>Asia/Dubai</option>
          <option>Europe/London</option>
          <option>America/New_York</option>
          <option>America/Los_Angeles</option>
        </select>
      </label>

      <div className="rounded-lg border border-zinc-700 p-4">
        <p className="font-medium mb-3">Working hours</p>
        <div className="space-y-2">
          {(Object.keys(DAY_LABELS) as (keyof WorkingHours)[]).map(day => (
            <div key={day} className="grid grid-cols-[3rem,auto,auto,auto] gap-3 items-center">
              <span className="text-sm text-zinc-300">{DAY_LABELS[day]}</span>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox"
                       checked={hours[day].holiday}
                       onChange={e=>updateDay(day, { holiday: e.target.checked })} />
                <span className="text-sm">Holiday</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">From</span>
                <input type="time" className="rounded-md bg-zinc-900 border border-zinc-700 px-2 py-1"
                       value={hours[day].from}
                       onChange={e=>updateDay(day, { from: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">To</span>
                <input type="time" className="rounded-md bg-zinc-900 border border-zinc-700 px-2 py-1"
                       value={hours[day].to}
                       onChange={e=>updateDay(day, { to: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button disabled={saving}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>

      {msg && <p className="text-emerald-400 text-sm">{msg}</p>}
      {err && <p className="text-red-400 text-sm">{err}</p>}
    </form>
  );
}
