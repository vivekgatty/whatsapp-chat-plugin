"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { getCustomFieldsForIndustry } from "@/lib/industry";
import type { Industry, BusinessSize } from "@/types";

const INDUSTRIES: { value: Industry; label: string; icon: string }[] = [
  { value: "food", label: "Food & Restaurant", icon: "🍕" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "retail", label: "Retail & E-commerce", icon: "🛒" },
  { value: "realestate", label: "Real Estate", icon: "🏠" },
  { value: "beauty", label: "Beauty & Salon", icon: "💇" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "logistics", label: "Logistics", icon: "🚚" },
  { value: "hospitality", label: "Hospitality", icon: "🏨" },
  { value: "legal", label: "Legal", icon: "⚖️" },
  { value: "fitness", label: "Fitness", icon: "💪" },
  { value: "events", label: "Events", icon: "🎉" },
  { value: "auto", label: "Automotive", icon: "🚗" },
  { value: "other", label: "Other", icon: "🏢" },
];

const SIZES: { value: BusinessSize; label: string; sub: string }[] = [
  { value: "solo", label: "Just me", sub: "Solo founder" },
  { value: "small", label: "2–10 people", sub: "Small team" },
  { value: "medium", label: "11–50 people", sub: "Growing business" },
];

export default function BusinessProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [size, setSize] = useState<BusinessSize>("small");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const selectedIndustry = industry || "other";
    const customFields = getCustomFieldsForIndustry(selectedIndustry);

    const { data: ws } = await supabase
      .from("workspaces")
      .update({
        name,
        industry: selectedIndustry,
        business_size: size,
        city,
        onboarding_step: "team_setup",
      })
      .eq("owner_id", user.id)
      .select("id")
      .single();

    if (ws && customFields.length > 0) {
      await supabase
        .from("workspaces")
        .update({
          // Store field definitions so the custom-fields settings page
          // and contact detail panel know which fields to render
        })
        .eq("id", ws.id);

      // Provision industry-specific system templates as draft entries
      const { getIndustryTemplatesOnly } = await import("@/lib/industry/system-templates");
      const templates = getIndustryTemplatesOnly(selectedIndustry);
      if (templates.length > 0) {
        await supabase.from("templates").insert(
          templates.map((t) => ({
            workspace_id: ws.id,
            name: t.name,
            display_name: t.display_name,
            body_text: t.body_text,
            category: t.category,
            language: "en",
            meta_template_status: "draft",
            industry_tags: t.industry_tags,
            is_system_template: true,
            variables: t.variables,
          }))
        );
      }
    }

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
        {/* Business Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya's Kitchen, Sunrise Dental"
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Industry - icon grid */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Industry <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.value}
                type="button"
                onClick={() => setIndustry(ind.value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                  industry === ind.value
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{ind.icon}</span>
                <span className="truncate">{ind.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Team Size */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Team Size</label>
          <div className="flex gap-3">
            {SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSize(s.value)}
                className={`flex-1 rounded-lg border px-4 py-3 text-center transition-colors ${
                  size === s.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p
                  className={`text-sm font-medium ${size === s.value ? "text-green-700" : "text-gray-900"}`}
                >
                  {s.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{s.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Bengaluru, Chennai"
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Logo upload placeholder */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Logo <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400">
            Upload logo (coming soon)
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/onboarding/team-setup")}
            className="rounded-lg border px-6 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
          >
            Skip
          </button>
          <button
            type="submit"
            disabled={saving || !name}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
