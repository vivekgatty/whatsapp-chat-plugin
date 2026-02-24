"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function TeamSetupPage() {
  const router = useRouter();
  const [emails, setEmails] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Send invitations via Resend and create agent records
    const _agentEmails = emails
      .split(",")
      .map((em) => em.trim())
      .filter(Boolean);

    await supabase
      .from("workspaces")
      .update({ onboarding_step: "first_template" })
      .eq("owner_id", user.id);

    router.push("/onboarding/first-template");
  }

  function handleSkip() {
    router.push("/onboarding/first-template");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={3} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Invite your team</h1>
      <p className="mb-8 text-gray-600">
        Add agents who&apos;ll manage conversations. You can do this later too.
      </p>
      <form onSubmit={handleInvite} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email addresses (comma-separated)
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="agent1@business.com, agent2@business.com"
            rows={3}
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
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
            {saving ? "Inviting…" : "Send invites"}
          </button>
        </div>
      </form>
    </div>
  );
}
