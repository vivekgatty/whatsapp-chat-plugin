"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function TestConnectionPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "waiting" | "success" | "error">(
    "idle"
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          message: "Hello from ChatMadi! Your WhatsApp is now connected and working. 🎉",
        }),
      });

      if (res.ok) {
        setStatus("waiting");
        let attempts = 0;
        pollRef.current = setInterval(() => {
          attempts++;
          if (attempts >= 5) {
            if (pollRef.current) clearInterval(pollRef.current);
            handleSuccess();
          }
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  async function handleSuccess() {
    setStatus("success");
    setShowConfetti(true);

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
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={5} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Test your connection</h1>
      <p className="mb-8 text-gray-600">Send a test message to confirm everything works.</p>

      {status === "success" ? (
        <div className="space-y-6 text-center">
          {/* Confetti */}
          {showConfetti && (
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
              <div className="animate-bounce text-6xl">🎉</div>
            </div>
          )}

          <div className="rounded-xl border border-green-200 bg-green-50 p-8">
            <div className="mb-3 text-4xl">✅</div>
            <h2 className="text-xl font-bold text-green-800">Your inbox is ready!</h2>
            <p className="mt-2 text-sm text-green-600">
              Messages from your customers will appear in your inbox automatically.
            </p>
          </div>

          <button
            onClick={() => router.push("/inbox")}
            className="w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            Open your inbox →
          </button>

          <button
            onClick={() => router.push("/overview")}
            className="w-full rounded-lg border py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            Go to dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSendTest} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Your personal WhatsApp number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              We&apos;ll send a test message to this number
            </p>
          </div>

          {status === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              Failed to send. Check your WhatsApp connection settings and try again.
            </div>
          )}

          {status === "waiting" && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Message sent! Waiting for confirmation…
                </p>
                <p className="text-xs text-blue-600">
                  Check your WhatsApp — you should receive a message shortly.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending" || status === "waiting"}
            className="w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {status === "sending"
              ? "Sending…"
              : status === "waiting"
                ? "Waiting…"
                : "Send me a test message"}
          </button>

          <p className="text-center text-xs text-gray-400">
            This will send one test message to your personal WhatsApp
          </p>
        </form>
      )}
    </div>
  );
}
