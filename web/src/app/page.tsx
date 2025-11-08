"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Log in — ChatMadi",
  description: "Sign in with a magic link to access your ChatMadi dashboard.",
  alternates: { canonical: "/" },
};

export default function LoginPage() {
  // Hide global header/topbar on this route only (keeps layout unchanged).
  // This CSS renders only on "/", so other pages are unaffected.
  const HideHeader = () => (
    <style
      // Keep this local to the page; does not modify global CSS files.
      dangerouslySetInnerHTML={{
        __html: `
          header, nav, .topbar, .site-header { display: none !important; }
          main { padding-top: 4rem; }
        `,
      }}
    />
  );

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      // Minimal browser client (public anon key)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Compute redirect target after email click.
      // Default to /dashboard; if ?next= is present on /, honor it.
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next");
      const redirectTo =
        (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) +
        (next || "/dashboard");

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        setError(error.message);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-black text-slate-100">
      <HideHeader />
      <div className="mx-auto w-full max-w-xl px-4 py-16">
        <h1 className="mb-6 text-3xl font-semibold">Log in</h1>

        <form onSubmit={sendMagicLink} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending" || !email}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-4 text-sm text-emerald-400">
            Check your inbox—your magic link is on the way.
          </p>
        )}
        {status === "error" && error && (
          <p className="mt-4 text-sm text-red-400">Error: {error}</p>
        )}
      </div>
    </main>
  );
}
