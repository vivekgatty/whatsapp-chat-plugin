"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      login: (
        callback: (response: FBLoginResponse) => void,
        options: Record<string, unknown>
      ) => void;
    };
  }
}

interface FBLoginResponse {
  authResponse?: {
    code: string;
    accessToken?: string;
  };
  status?: string;
}

interface MetaEmbeddedSignupProps {
  onSuccess?: (data: { accessToken: string; wabaId: string; phoneNumberId: string }) => void;
  onError?: (error: string) => void;
}

export function MetaEmbeddedSignup({ onSuccess, onError }: MetaEmbeddedSignupProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com") return;
      if (event.data?.type === "WA_EMBEDDED_SIGNUP") {
        const { event: signupEvent } = event.data;
        if (signupEvent === "FINISH") {
          console.log("Embedded signup flow completed");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const launchSignup = () => {
    setIsLoading(true);
    setStatus("connecting");
    setErrorMessage(null);

    if (typeof window === "undefined" || !window.FB) {
      const msg = "Facebook SDK not loaded. Please refresh and try again.";
      setErrorMessage(msg);
      setStatus("error");
      setIsLoading(false);
      onError?.(msg);
      return;
    }

    window.FB.login(
      async (response: FBLoginResponse) => {
        if (response.authResponse?.code) {
          try {
            const res = await fetch("/api/whatsapp/embedded-signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: response.authResponse.code,
              }),
            });

            const data = await res.json();

            if (data.error) {
              setErrorMessage(data.error);
              setStatus("error");
              onError?.(data.error);
            } else {
              setStatus("success");
              onSuccess?.({
                accessToken: data.accessToken,
                wabaId: data.wabaId,
                phoneNumberId: data.phoneNumberId,
              });
            }
          } catch {
            const msg = "Failed to complete WhatsApp setup. Please try again.";
            setErrorMessage(msg);
            setStatus("error");
            onError?.(msg);
          }
        } else {
          const msg = "WhatsApp setup was cancelled or failed.";
          setErrorMessage(msg);
          setStatus("error");
          onError?.(msg);
        }
        setIsLoading(false);
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">WhatsApp Business connected!</p>
        <Link
          href="/onboarding/business-profile"
          className="mt-3 inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Continue Setup
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        onLoad={() => {
          window.FB?.init({
            appId: process.env.NEXT_PUBLIC_META_APP_ID,
            cookie: true,
            xfbml: true,
            version: "v19.0",
          });
          setSdkLoaded(true);
        }}
      />
      <div className="space-y-4">
        <button
          onClick={launchSignup}
          disabled={!sdkLoaded || isLoading}
          className="w-full rounded-lg bg-[#1877F2] py-3 text-sm font-medium text-white hover:bg-[#166FE5] disabled:opacity-50"
        >
          {isLoading ? "Setting up…" : "Connect WhatsApp Business"}
        </button>
        {status === "error" && errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
        <p className="text-xs text-gray-500">
          This will open Meta&apos;s secure signup flow. You&apos;ll need a Facebook Business
          account and access to your WhatsApp Business Account.
        </p>
      </div>
    </>
  );
}
