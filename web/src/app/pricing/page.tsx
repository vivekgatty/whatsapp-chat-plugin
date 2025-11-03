import PayButton from "../../components/PayButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="text-sm text-zinc-400">Upgrade to Pro to remove limits.</p>
        </div>
        <Link href="/dashboard" className="rounded-md bg-emerald-600 px-4 py-2 text-white">
          Back to dashboard
        </Link>
      </div>

      {/* Free vs Pro */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 p-6">
          <h2 className="text-xl font-medium">Free</h2>
          <p className="mt-2 text-sm text-zinc-400">100 messages/month, basic widget.</p>
          <div className="mt-4 text-2xl">₹0</div>
        </div>

        <div className="rounded-xl border border-emerald-800/40 bg-emerald-900/10 p-6">
          <h2 className="text-xl font-medium">Pro</h2>
          <p className="mt-2 text-sm text-zinc-400">Higher limits & premium features.</p>
          <div className="mt-4 text-2xl">₹1 (test charge)</div>

          <div className="mt-6">
            {/* Live Razorpay (₹1) */}
            <PayButton plan="pro" amount={1} />
          </div>
        </div>
      </div>
    </div>
  );
}
