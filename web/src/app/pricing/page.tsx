"use client";
import * as React from "react";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const revalidate=0;

export default function Pricing(){
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function startSubscription() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch("/api/billing/create-subscription", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      const url = json?.checkout_url || json?.short_url || json?.redirect_url;
      if (url) {
        window.location.href = url;
      } else {
        setErr("Could not start subscription. Check server logs/keys.");
      }
    } catch (e:any) {
      setErr(e.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Pricing</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Start your subscription to unlock production features.
      </p>
      <button onClick={startSubscription} disabled={loading}
        className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white disabled:opacity-60">
        {loading ? "Redirecting…" : "Start subscription"}
      </button>
      {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
    </main>
  );
}
