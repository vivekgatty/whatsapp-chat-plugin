import Link from "next/link";
import { getSupabaseServer } from "../../lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Task = {
  id: string;
  area: string;    // Payments / API / Backend / Dashboard
  layer: string;   // Backend / Frontend
  title: string;
  notes: string;
};

const TASKS: Task[] = [
  {
    id: "Day5-01",
    area: "Payments",
    layer: "Backend",
    title: "Integrate Razorpay test Checkout",
    notes: "Client checkout; test keys; success/failure routes"
  },
  {
    id: "Day5-02",
    area: "API",
    layer: "Backend",
    title: "Webhook verify signature & record payment",
    notes: "HMAC verify; update subscriptions table"
  },
  {
    id: "Day5-03",
    area: "Backend",
    layer: "Backend",
    title: "Plan logic (Free vs Pro) & limits",
    notes: "100 messages/month limit; quota counters"
  },
  {
    id: "Day5-04",
    area: "Dashboard",
    layer: "Frontend",
    title: "Auto-upgrade prompts when limit hit",
    notes: "Banner/modal; CTA to upgrade"
  },
  {
    id: "Day5-05",
    area: "Dashboard",
    layer: "Frontend",
    title: "Billing page + invoices link",
    notes: "Past invoices URL; update billing details"
  },
];

function Pill({children}:{children: React.ReactNode}) {
  return <span className="inline-block rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">{children}</span>;
}

export default async function PricingPage() {
  const supabase = await getSupabaseServer().catch(() => null);
  let userEmail: string | null = null;
  let plan: string | null = null;
  let subStatus: string | null = null;

  try {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("plan, subscription_status")
          .eq("id", user.id)
          .maybeSingle();
        plan = data?.plan ?? null;
        subStatus = data?.subscription_status ?? null;
      }
    }
  } catch {}

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="text-sm text-zinc-400 mt-1">Subscription management — Day 5 scope.</p>
        </div>
        <Link href="/dashboard" className="px-3 py-2 rounded-md bg-emerald-600 text-white">Back to dashboard</Link>
      </header>

      <section className="rounded-xl border border-zinc-700 p-5">
        <h2 className="font-medium">Your plan</h2>
        <p className="text-sm text-zinc-400 mt-1">
          {userEmail ? <>Signed in as <span className="text-zinc-200">{userEmail}</span>.</> : "Not signed in."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill>Plan: {plan ?? "Free (default)"}</Pill>
          <Pill>Status: {subStatus ?? "not_subscribed"}</Pill>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">Day 5 — Tasks</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {TASKS.map(t => (
            <div key={t.id} className="rounded-xl border border-zinc-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.title}</h3>
                <span className="text-xs text-zinc-400">{t.id}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Pill>{t.area}</Pill>
                <Pill>{t.layer}</Pill>
              </div>
              <p className="text-sm text-zinc-300 mt-3">{t.notes}</p>
              {/* Buttons are placeholders to wire up when each task is implemented */}
              <div className="mt-4 flex flex-wrap gap-2">
                {t.id === "Day5-01" && (
                  <button disabled className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 cursor-not-allowed">
                    Test Checkout (coming soon)
                  </button>
                )}
                {t.id === "Day5-05" && (
                  <button disabled className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 cursor-not-allowed">
                    View invoices (coming soon)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
