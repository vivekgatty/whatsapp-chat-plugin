import PayButton from "../../components/PayButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="text-sm text-zinc-400">Upgrade to Pro to remove limits.</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 rounded-md bg-emerald-600 text-white">Back to dashboard</Link>
      </div>

      {/* Free vs Pro */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-medium">Free</h2>
          <p className="text-sm text-zinc-400 mt-2">100 messages/month, basic widget.</p>
          <div className="mt-4 text-2xl">₹0</div>
        </div>

        <div className="border border-emerald-800/40 rounded-xl p-6 bg-emerald-900/10">
          <h2 className="text-xl font-medium">Pro</h2>
          <p className="text-sm text-zinc-400 mt-2">Higher limits & premium features.</p>
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
