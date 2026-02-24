"use client";

import { useState } from "react";

export function MetaEmbeddedSignup() {
  const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");

  async function handleConnect() {
    setStatus("connecting");

    try {
      // Meta Embedded Signup uses the Facebook Login SDK
      // This launches the Meta OAuth popup flow
      const FB = (window as Record<string, unknown>).FB as
        | {
            login: (
              cb: (res: { authResponse?: { code: string } }) => void,
              opts: Record<string, unknown>
            ) => void;
          }
        | undefined;

      if (!FB) {
        window.open(
          `https://www.facebook.com/v21.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + "/api/whatsapp/embedded-signup")}&scope=whatsapp_business_management,whatsapp_business_messaging`,
          "meta_signup",
          "width=600,height=700"
        );
        return;
      }

      FB.login(
        async (response) => {
          if (response.authResponse?.code) {
            const res = await fetch("/api/whatsapp/embedded-signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: response.authResponse.code }),
            });
            if (res.ok) {
              setStatus("success");
            } else {
              setStatus("error");
            }
          } else {
            setStatus("error");
          }
        },
        {
          config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
          response_type: "code",
          override_default_response_type: true,
        }
      );
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">WhatsApp Business connected!</p>
        <a
          href="/onboarding/business-profile"
          className="mt-3 inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Continue Setup
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleConnect}
        disabled={status === "connecting"}
        className="w-full rounded-lg bg-[#1877F2] py-3 text-sm font-medium text-white hover:bg-[#166FE5] disabled:opacity-50"
      >
        {status === "connecting" ? "Connecting…" : "Connect with Facebook"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">Connection failed. Please try again.</p>
      )}
      <p className="text-xs text-gray-500">
        This will open Meta&apos;s secure signup flow. You&apos;ll need a Facebook Business account
        and access to your WhatsApp Business Account.
      </p>
    </div>
  );
}
