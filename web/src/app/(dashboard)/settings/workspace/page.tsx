"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { Industry } from "@/types";

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "food", label: "Food & Restaurant" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "realestate", label: "Real Estate" },
  { value: "beauty", label: "Beauty & Salon" },
  { value: "finance", label: "Finance" },
  { value: "logistics", label: "Logistics" },
  { value: "hospitality", label: "Hospitality" },
  { value: "legal", label: "Legal" },
  { value: "fitness", label: "Fitness" },
  { value: "events", label: "Events" },
  { value: "auto", label: "Automotive" },
  { value: "other", label: "Other" },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Colombo",
  "Asia/Dhaka",
  "Asia/Kathmandu",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
];

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const { data } = await supabase.from("workspaces").select("*").limit(1).single();
    if (data) {
      setName(data.name ?? "");
      setIndustry(data.industry ?? "");
      setWebsite(data.website ?? "");
      setAddress(data.address ?? "");
      setCity(data.city ?? "");
      setTimezone(data.timezone ?? "Asia/Kolkata");
      setLanguage(data.language ?? "en");
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("workspaces")
        .update({ name, industry: industry || "other", website, address, city, timezone, language })
        .eq("owner_id", user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Workspace Settings</h1>
      <div className="space-y-5 rounded-xl border bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value as Industry)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm"
          >
            <option value="">Select…</option>
            {INDUSTRIES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourbusiness.com"
            className="w-full rounded-lg border px-4 py-2.5 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Default Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
              <option value="mr">Marathi</option>
            </select>
          </div>
        </div>

        {/* Logo upload placeholder */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Logo</label>
          <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400">
            Upload logo (coming soon)
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
