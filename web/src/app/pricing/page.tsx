import Link from "next/link";
import PayButton from "../../components/PayButton";
import { getSupabaseServer } from "../../lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PricingPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? "guest";

  // Optional: read current plan
  let profile: any = null;
  try {
    profile = (await supabase.from("profiles").select("plan,subscription_status").eq("id", user?.id ?? "").maybeSingle()).data;
  } catch {}

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="text-sm text-zinc-400">Manage your subscription.</p>
          <p className="text-xs text-zinc-500 mt-1">Signed in as {email}. Current plan: {profile?.plan ?? "free"} ({profile?.subscription_status ?? "not_subscribed"}).</p>
        </div>
        <Link href="/dashboard" className="px-3 py-2 rounded-md bg-emerald-600 text-white">Back to dashboard</Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-zinc-700 p-5">
          <h2 className="text-xl font-medium">Free</h2>
          <p className="text-sm text-zinc-400 mt-1">₹0 / month · 100 messages/mo</p>
          <ul className="mt-3 text-sm text-zinc-300 list-disc pl-5 space-y-1">
            <li>WhatsApp button + pre-chat form</li>
            <li>Basic analytics</li>
            <li>Community support</li>
          </ul>
          <div className="mt-4 text-sm text-zinc-500">You are on this plan by default.</div>
        </div>

        {/* Pro */}
        <div className="rounded-xl border border-zinc-700 p-5">
          <h2 className="text-xl font-medium">Pro</h2>
          <p className="text-sm text-zinc-400 mt-1">Intro offer: <span className="text-white font-semibold">₹1</span> (LIVE payment for validation)</p>
          <ul className="mt-3 text-sm text-zinc-300 list-disc pl-5 space-y-1">
            <li>Increased quotas</li>
            <li>Priority processing</li>
            <li>Early access features</li>
          </ul>
          <div className="mt-4">
            {/* LIVE ₹1 subscribe */}
            <PayButton amount={1} />
          </div>
          <p className="text-xs text-zinc-500 mt-2">You will be charged ₹1 now (LIVE). We will switch to your real price later.</p>
        </div>
      </section>
    </main>
  );
}

// deploy-bump 2025-10-30T22:03:52
