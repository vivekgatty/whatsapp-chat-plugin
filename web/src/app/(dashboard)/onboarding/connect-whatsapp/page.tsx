"use client";

import { MetaEmbeddedSignup } from "@/components/onboarding/MetaEmbeddedSignup";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

export default function ConnectWhatsAppPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={1} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Connect your WhatsApp Business</h1>
      <p className="mb-8 text-gray-600">
        Link your WhatsApp Business Account via Meta&apos;s secure signup flow.
      </p>
      <MetaEmbeddedSignup />
    </div>
  );
}
