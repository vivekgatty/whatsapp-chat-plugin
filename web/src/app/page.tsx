"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function Page() {
  const [email, setEmail] = useState("");
  const [status, setStatus] =
    useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard/overview`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="min-h-screen px-4 flex items-start justify-center pt-16">
      {/* Hide any global header/topbar/nav ONLY on this page (/) */}
      <style>{`
        header, nav, .topbar, .site-header, [data-topbar] {
          display: none !important;
        }
      `}</style>

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-6">Log in</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 outline-none"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-md px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-3 text-sm text-slate-400">
            Check your inbox for a secure sign-in link.
          </p>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-red-400">
            Couldn’t send the link. Please verify the email and try again.
          </p>
        )}
      </div>
    </main>
  );
}
