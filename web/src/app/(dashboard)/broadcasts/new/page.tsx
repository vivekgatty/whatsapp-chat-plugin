"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BroadcastAudienceType } from "@/types";

export default function NewBroadcastPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [audienceType, setAudienceType] = useState<BroadcastAudienceType>("all");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // TODO: Create broadcast record, select template, resolve audience
    setSaving(false);
    router.push("/broadcasts");
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Create Broadcast</h1>
      <p className="mb-8 text-gray-600">Select a template and audience to send a bulk message.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Broadcast Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. January Promo, Appointment Reminders"
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Template</label>
          <select className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
            <option value="">Select an approved template…</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Audience</label>
          <select
            value={audienceType}
            onChange={(e) => setAudienceType(e.target.value as BroadcastAudienceType)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          >
            <option value="all">All opted-in contacts</option>
            <option value="tag">By tag</option>
            <option value="segment">By segment filter</option>
            <option value="manual">Manual selection</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create & Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
