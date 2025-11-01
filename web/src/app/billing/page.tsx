export const dynamic = "force-dynamic";

import Link from "next/link";

export default async function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Billing</h1>
        <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 rounded px-3 py-2 text-sm">
          Back to dashboard
        </Link>
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="font-medium mb-2">Manage subscription</div>
        <a href="/api/billing/portal"
           className="inline-block bg-sky-600 hover:bg-sky-500 rounded px-4 py-2 text-sm font-medium">
          Open billing portal
        </a>
        <p className="text-xs text-slate-400 mt-2">
          This opens the secure Razorpay Customer Portal to manage your subscription.
        </p>
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="font-medium mb-1">Receipts</div>
        <p className="text-sm text-slate-300">
          Your payment receipts are available inside the billing portal.
        </p>
      </div>
    </div>
  );
}