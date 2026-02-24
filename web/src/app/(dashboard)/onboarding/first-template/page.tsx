"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { WhatsAppPreview } from "@/components/shared/WhatsAppPreview";
import { getBrowserSupabase } from "@/lib/supabase/browser";

interface SystemTemplate {
  name: string;
  body: string;
  category: string;
}

const INDUSTRY_TEMPLATES: Record<string, SystemTemplate[]> = {
  food: [
    {
      name: "order_confirmation",
      body: "Hi {{1}}! Your order #{{2}} has been received and is being prepared. Estimated time: {{3}} minutes. 🍕",
      category: "UTILITY",
    },
    {
      name: "delivery_update",
      body: "Great news {{1}}! Your order is out for delivery. Track here: {{2}}",
      category: "UTILITY",
    },
    {
      name: "welcome_food",
      body: "Welcome to {{1}}! 🎉 Order your favourite meals directly on WhatsApp. Reply MENU to see today's specials.",
      category: "MARKETING",
    },
  ],
  healthcare: [
    {
      name: "appointment_reminder",
      body: "Hi {{1}}, this is a reminder for your appointment with {{2}} on {{3}}. Reply CONFIRM to confirm or RESCHEDULE to change.",
      category: "UTILITY",
    },
    {
      name: "prescription_ready",
      body: "Hi {{1}}, your prescription from Dr. {{2}} is ready. You can collect it from the reception.",
      category: "UTILITY",
    },
    {
      name: "health_checkup",
      body: "Hi {{1}}, it's time for your annual health checkup! Book your slot: {{2}}",
      category: "MARKETING",
    },
  ],
  retail: [
    {
      name: "order_shipped",
      body: "Hi {{1}}! Your order #{{2}} has been shipped. Track it here: {{3}} 📦",
      category: "UTILITY",
    },
    {
      name: "back_in_stock",
      body: "Great news {{1}}! {{2}} is back in stock. Get yours before it sells out: {{3}}",
      category: "MARKETING",
    },
    {
      name: "order_thank_you",
      body: "Thank you for your order {{1}}! 🙏 We're packing it with care. You'll receive tracking details shortly.",
      category: "UTILITY",
    },
  ],
  default: [
    {
      name: "welcome_message",
      body: "Hi {{1}}, thank you for reaching out to {{2}}! We'll get back to you shortly. 🙏",
      category: "UTILITY",
    },
    {
      name: "follow_up",
      body: "Hi {{1}}, just checking in! Is there anything else we can help you with?",
      category: "UTILITY",
    },
    {
      name: "promotion",
      body: "Hi {{1}}! We have an exciting offer for you: {{2}}. Valid till {{3}}. Reply to know more!",
      category: "MARKETING",
    },
  ],
};

export default function FirstTemplatePage() {
  const router = useRouter();
  const [templateBody, setTemplateBody] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<SystemTemplate[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadIndustry() {
      const supabase = getBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ws } = await supabase
        .from("workspaces")
        .select("industry")
        .eq("owner_id", user.id)
        .single();
      const industry = ws?.industry ?? "default";
      setTemplates(INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES.default);
    }
    loadIndustry();
  }, []);

  function selectTemplate(t: SystemTemplate) {
    setTemplateName(t.name);
    setTemplateBody(t.body);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Submit template to Meta API via /api/whatsapp/templates
    await supabase
      .from("workspaces")
      .update({ onboarding_step: "test_connection" })
      .eq("owner_id", user.id);

    router.push("/onboarding/test-connection");
  }

  async function handleSkip() {
    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("workspaces")
        .update({ onboarding_step: "test_connection" })
        .eq("owner_id", user.id);
    }
    router.push("/onboarding/test-connection");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <OnboardingProgress currentStep={4} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Create your first template</h1>
      <p className="mb-8 text-gray-600">
        WhatsApp requires pre-approved templates for starting conversations. Pick one below or write
        your own.
      </p>

      {/* Pre-built templates */}
      <div className="mb-8">
        <p className="mb-3 text-sm font-medium text-gray-700">Recommended for your industry</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => selectTemplate(t)}
              className={`rounded-xl border p-4 text-left transition-all ${
                templateName === t.name
                  ? "border-green-500 bg-green-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                  {t.category}
                </span>
              </div>
              <p className="line-clamp-3 text-sm text-gray-700">{t.body}</p>
              <p className="mt-2 text-xs font-medium text-green-600">Use this template →</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Template form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Template name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) =>
                setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
              }
              placeholder="welcome_message"
              className="w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Lowercase and underscores only</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Message body</label>
            <textarea
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              rows={5}
              maxLength={1024}
              placeholder="Hi {{1}}, thank you for contacting us!"
              className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>
                Use {"{{1}}"}, {"{{2}}"} for variables
              </span>
              <span>{templateBody.length}/1024</span>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            Templates require Meta review (24–72 hours). You can continue setup while it&apos;s
            being reviewed.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-lg border px-6 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={saving || !templateBody}
              className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        </form>

        {/* Live preview */}
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Live Preview</p>
          <WhatsAppPreview body={templateBody || "Your message preview will appear here…"} />
        </div>
      </div>
    </div>
  );
}
