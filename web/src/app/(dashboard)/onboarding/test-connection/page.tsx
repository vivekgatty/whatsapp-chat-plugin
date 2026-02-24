"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function TestConnectionPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: "Hello from ChatMadi! 🎉" }),
      });

      if (res.ok) {
        setStatus("success");

        const supabase = getBrowserSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("workspaces")
            .update({ onboarding_completed: true, onboarding_step: "done" })
            .eq("owner_id", user.id);
        }
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={5} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Test your connection</h1>
      <p className="mb-8 text-gray-600">Send a test message to confirm everything works.</p>

      {status === "success" ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-lg font-semibold text-green-800">Message sent successfully!</p>
            <p className="mt-1 text-sm text-green-600">Your WhatsApp Business is ready to go.</p>
          </div>
          <button
            onClick={() => router.push("/overview")}
            className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSendTest} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Your WhatsApp number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-red-600">
              Failed to send. Check your connection settings and try again.
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send test message"}
          </button>
        </form>
      )}
    </div>
  );
}
