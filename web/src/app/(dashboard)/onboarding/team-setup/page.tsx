"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";

interface Invite {
  email: string;
  role: "admin" | "agent";
}

export default function TeamSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "agent">("agent");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [saving, setSaving] = useState(false);

  function handleAdd() {
    if (!email.trim() || invites.some((i) => i.email === email.trim())) return;
    setInvites([...invites, { email: email.trim(), role }]);
    setEmail("");
  }

  function handleRemove(idx: number) {
    setInvites(invites.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Send invitations via Resend and create agent records
    await supabase
      .from("workspaces")
      .update({ onboarding_step: "first_template" })
      .eq("owner_id", user.id);

    router.push("/onboarding/first-template");
  }

  async function handleSkip() {
    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("workspaces")
        .update({ onboarding_step: "first_template" })
        .eq("owner_id", user.id);
    }
    router.push("/onboarding/first-template");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={3} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Invite your team
      </h1>
      <p className="mb-8 text-gray-600">
        Add your staff who will handle customer conversations.
      </p>

      {/* Add invite form */}
      <div className="mb-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@business.com"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          className="flex-1 rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "agent")}
          className="rounded-lg border px-3 py-2.5 text-sm"
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!email.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Role explanation */}
      <div className="mb-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
        <strong>Agents</strong> can see and reply to conversations.{" "}
        <strong>Admins</strong> can also change settings and manage the team.
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Pending invites ({invites.length})
          </p>
          {invites.map((inv, idx) => (
            <div
              key={inv.email}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-2.5"
            >
              <div>
                <span className="text-sm text-gray-900">{inv.email}</span>
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {inv.role}
                </span>
              </div>
              <button
                onClick={() => handleRemove(idx)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-lg border px-6 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
        >
          Skip for now
        </button>
        <button
          onClick={handleSend}
          disabled={saving || invites.length === 0}
          className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Sending invites…" : `Send ${invites.length || ""} invite${invites.length !== 1 ? "s" : ""} & continue`}
        </button>
      </div>
    </div>
  );
}
