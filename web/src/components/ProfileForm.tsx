// src/components/ProfileForm.tsx
"use client";

import { useState, useTransition } from "react";

type Profile = {
  company_name: string | null;
  category: string | null;
  wa_number: string | null;
  timezone: string | null;
  working_hours: any | null;
  name?: string | null;
  email?: string | null;
};

export default function ProfileForm({ initial }: { initial: Profile }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<Profile>({
    company_name: initial.company_name ?? "",
    category: initial.category ?? "",
    wa_number: initial.wa_number ?? "",
    timezone: initial.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    working_hours: initial.working_hours ?? {
      mon_fri: "09:00-18:00",
      sat: "10:00-14:00",
      sun: "off",
    },
    name: initial.name ?? "",
  });
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json?.error ?? "Save failed");
        return;
      }
      setMsg("Saved!");
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm">Business / Company name</label>
        <input
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
          value={form.company_name ?? ""}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          placeholder="Acme Co."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Category</label>
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
            value={form.category ?? ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Services"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">WhatsApp number (E.164)</label>
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
            value={form.wa_number ?? ""}
            onChange={(e) => setForm({ ...form, wa_number: e.target.value })}
            placeholder="+919876543210"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Contact name</label>
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Timezone</label>
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
            value={form.timezone ?? ""}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            placeholder="Asia/Kolkata"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm">Working hours (JSON)</label>
        <textarea
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
          rows={4}
          value={JSON.stringify(form.working_hours ?? {}, null, 2)}
          onChange={(e) => {
            try {
              const obj = JSON.parse(e.target.value);
              setForm({ ...form, working_hours: obj });
              setMsg("");
            } catch {
              setMsg("Working hours must be valid JSON");
            }
          }}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-black hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>

      {msg && <p className="mt-2 text-sm opacity-80">{msg}</p>}
    </form>
  );
}
