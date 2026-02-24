"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function FirstTemplatePage() {
  const router = useRouter();
  const [templateBody, setTemplateBody] = useState(
    "Hi {{1}}, thank you for reaching out to us! We'll get back to you shortly."
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Submit template to Meta for approval
    await supabase
      .from("workspaces")
      .update({ onboarding_step: "test_connection" })
      .eq("owner_id", user.id);

    router.push("/onboarding/test-connection");
  }

  function handleSkip() {
    router.push("/onboarding/test-connection");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={4} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Create your first template</h1>
      <p className="mb-8 text-gray-600">
        WhatsApp requires pre-approved templates for starting conversations.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Welcome message template
          </label>
          <textarea
            value={templateBody}
            onChange={(e) => setTemplateBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use {"{{1}}"}, {"{{2}}"} etc. for dynamic variables.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 rounded-lg border py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Submitting…" : "Submit for approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
