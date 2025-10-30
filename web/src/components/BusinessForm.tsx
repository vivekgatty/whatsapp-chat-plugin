"use client";

import React, { useEffect, useMemo, useState } from "react";
import CountryCodeSelect from "./CountryCodeSelect";
import HoursEditor, { defaultHours, HoursState } from "./HoursEditor";

type Props = {
  action: (fd: FormData) => void | Promise<void>;
  initial: {
    name?: string;
    category?: string;
    contact_name?: string;
    timezone?: string;
    whatsapp_cc?: string;        // "+91"
    whatsapp_number?: string;    // national digits
    hours?: HoursState | null;
  };
};

export default function BusinessForm({ action, initial }: Props) {
  const [cc, setCc] = useState(initial.whatsapp_cc || "+91");
  const [num, setNum] = useState(initial.whatsapp_number || "");
  const [hours, setHours] = useState<HoursState>(initial.hours ?? defaultHours);

  // keep only digits for number
  function onNum(v: string) {
    setNum(v.replace(/[^\d]/g, ""));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="whatsapp_cc" value={cc}/>
      <input type="hidden" name="hours_json" value={JSON.stringify(hours)} />

      <div className="grid gap-4">
        <label className="text-sm">
          <span className="block text-zinc-400 mb-1">Business / company name</span>
          <input name="name" defaultValue={initial.name ?? ""} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none"/>
        </label>

        <label className="text-sm">
          <span className="block text-zinc-400 mb-1">Category</span>
          <input name="category" defaultValue={initial.category ?? ""} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none"/>
        </label>

        <div className="text-sm">
          <span className="block text-zinc-400 mb-1">WhatsApp number (E.164)</span>
          <div className="flex items-center gap-3">
            <CountryCodeSelect name="wa_cc_visible" value={cc} onChange={setCc} />
            <input
              name="whatsapp_number"
              inputMode="numeric"
              value={num}
              onChange={(e) => onNum(e.target.value)}
              placeholder="9876543210"
              className="flex-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">We’ll store the full E.164 as <code>{cc}{num ? " " + num : ""}</code>.</p>
        </div>

        <label className="text-sm">
          <span className="block text-zinc-400 mb-1">Contact name</span>
          <input name="contact_name" defaultValue={initial.contact_name ?? ""} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none"/>
        </label>

        <label className="text-sm">
          <span className="block text-zinc-400 mb-1">Timezone</span>
          <select name="timezone" defaultValue={initial.timezone ?? "Asia/Kolkata"} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2">
            <option>Asia/Kolkata</option>
            <option>Asia/Dubai</option>
            <option>Asia/Singapore</option>
            <option>Europe/London</option>
            <option>America/New_York</option>
            <option>America/Los_Angeles</option>
          </select>
        </label>

        <div className="text-sm">
          <span className="block text-zinc-400 mb-2">Working hours</span>
          <HoursEditor value={initial.hours ?? undefined} onChange={setHours} />
          <p className="mt-2 text-xs text-zinc-500">Choose hours in 12-hour format or mark a day as Holiday.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white">Save profile</button>
        <a href="/dashboard" className="rounded-md border border-zinc-600 px-4 py-2">Cancel</a>
      </div>
    </form>
  );
}
