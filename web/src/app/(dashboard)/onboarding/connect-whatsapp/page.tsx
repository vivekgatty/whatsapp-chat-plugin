"use client";

import { useRouter } from "next/navigation";
import { MetaEmbeddedSignup } from "@/components/onboarding/MetaEmbeddedSignup";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useState } from "react";

const STEPS = [
  { num: 1, label: "Connect your Meta Business Account" },
  { num: 2, label: "Add your WhatsApp number" },
  { num: 3, label: "Start managing conversations" },
];

export default function ConnectWhatsAppPage() {
  const router = useRouter();
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);

  async function handleSuccess(data: { phoneNumber?: string; businessName?: string }) {
    setConnectedPhone(data?.phoneNumber ?? "Connected");
    const supabase = getBrowserSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("workspaces")
        .update({ onboarding_step: "business_profile" })
        .eq("owner_id", user.id);
    }
    setTimeout(() => router.push("/onboarding/business-profile"), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={1} totalSteps={5} />

      <h1 className="mb-2 text-2xl font-bold text-gray-900">Connect your WhatsApp Business</h1>
      <p className="mb-1 text-sm text-gray-500">Setup takes about 3 minutes</p>
      <p className="mb-8 text-gray-600">
        Link your WhatsApp Business Account via Meta&apos;s secure signup flow.
      </p>

      {/* Animated 3-step explainer */}
      <div className="mb-8 space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="flex animate-[fadeSlideIn_0.5s_ease_forwards] items-center gap-3 opacity-0"
            style={{ animationDelay: `${i * 200}ms` }}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              {step.num}
            </div>
            <span className="text-sm text-gray-700">{step.label}</span>
            {i < STEPS.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {/* Success state */}
      {connectedPhone ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="mb-2 text-3xl">✅</div>
          <p className="text-lg font-semibold text-green-800">WhatsApp Connected!</p>
          <p className="mt-1 text-sm text-green-600">{connectedPhone}</p>
          <p className="mt-2 text-xs text-green-500">Redirecting to next step…</p>
        </div>
      ) : (
        <>
          <MetaEmbeddedSignup
            onSuccess={(data) =>
              handleSuccess({
                phoneNumber: data.phoneNumberId,
                businessName: data.wabaId,
              })
            }
          />

          {/* Trust badges */}
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
              <span className="text-lg">🔒</span>
              <p className="text-xs text-gray-500">
                Your WhatsApp number remains yours. We never see your personal chats. ChatMadi only
                accesses your Business Account messages.
              </p>
            </div>
            <p className="text-center text-xs text-gray-400">
              Don&apos;t have a Meta Business Account?{" "}
              <a
                href="https://business.facebook.com/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline"
              >
                Create one — it&apos;s free
              </a>
            </p>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
