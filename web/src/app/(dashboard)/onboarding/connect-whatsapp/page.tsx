"use client";

import { useRouter } from "next/navigation";
import { MetaEmbeddedSignup } from "@/components/onboarding/MetaEmbeddedSignup";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function ConnectWhatsAppPage() {
  const router = useRouter();

  async function handleSuccess() {
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
    router.push("/onboarding/business-profile");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <OnboardingProgress currentStep={1} totalSteps={5} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Connect your WhatsApp Business</h1>
      <p className="mb-8 text-gray-600">
        Link your WhatsApp Business Account via Meta&apos;s secure signup flow.
      </p>
      <MetaEmbeddedSignup onSuccess={handleSuccess} />
    </div>
  );
}
