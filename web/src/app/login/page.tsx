// src/app/login/page.tsx
"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Ensure this route renders dynamically so Next.js doesn't try to prerender it
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const supabase = createClientComponentClient();
  const search = useSearchParams();
  const redirectedFrom = search.get("redirectedFrom") || "/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback?redirectedFrom=${encodeURIComponent(
      redirectedFrom
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // send the magic link to our server callback
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
    // (Optional) remember email locally for convenience
    try {
      localStorage.setItem("wcp_last_email", email);
    } catch {}
  }

  return (
    <main className="min-h-dvh max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Log in</h1>

      {status !== "sent" ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      ) : (
        <div className="rounded-md border border-zinc-700 p-4">
          <p className="text-emerald-400 font-medium mb-1">Check your email</p>
          <p className="text-sm text-zinc-300">
            We sent a magic link to <b>{email}</b>. Click it to finish logging
            in. You’ll land on <code>{redirectedFrom}</code>.
          </p>
        </div>
      )}
    </main>
  );
}
