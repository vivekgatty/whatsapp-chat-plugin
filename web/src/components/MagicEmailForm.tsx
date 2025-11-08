"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Props = {
  cta?: string;          // button label
  className?: string;    // optional extra classes
};

export default function MagicEmailForm({ cta = "Get magic link", className = "" }: Props) {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, anon);
  }, []);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    setMsg("");

    try {
      const redirect = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      });
      if (error) throw error;
      setStatus("sent");
      setMsg(`Magic link sent to ${email}. Check your inbox (and Spam/Junk).`);
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className={`mt-6 flex max-w-md items-center gap-2 ${className}`} aria-label="Start with your email to receive a magic link">
        <input
          name="email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base outline-none ring-0 placeholder:text-slate-500 disabled:opacity-60"
          disabled={status === "sending" || status === "sent"}
        />
        <button
          type="submit"
          disabled={status === "sending" || status === "sent"}
          className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : cta}
        </button>
      </form>

      {msg && (
        <p className={`mt-2 text-xs ${status === "error" ? "text-rose-400" : "text-slate-400"}`}>
          {msg}
        </p>
      )}
    </>
  );
}
