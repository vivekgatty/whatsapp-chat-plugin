"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { Industry, BusinessSize } from "@/types";

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

const SIZES: { value: BusinessSize; label: string }[] = [
  { value: "solo", label: "Just me" },
  { value: "small", label: "2–10 people" },
  { value: "medium", label: "11–50 people" },
];

export default function BusinessProfilePage() {
  const router = useRouter();
  const [industry, setIndustry] = useState<Industry>("other");
  const [size, setSize] = useState<BusinessSize>("small");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("workspaces")
      .update({
        name,
        industry,
        business_size: size,
        onboarding_step: "team_setup",
      })
      .eq("owner_id", user.id);

    router.push("/onboarding/team-setup");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={2} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Tell us about your business</h1>
      <p className="mb-8 text-gray-600">
        We&apos;ll customize your CRM experience based on your industry.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value as Industry)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          >
            {INDUSTRIES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Team Size</label>
          <div className="flex gap-3">
            {SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSize(s.value)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm ${size === s.value ? "border-green-500 bg-green-50 text-green-700" : "text-gray-600"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
