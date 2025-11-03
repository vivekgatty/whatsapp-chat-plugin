export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import BillingClient from "../../components/BillingClient";

export default function Page() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <Link href="/dashboard" className="rounded border border-slate-700 bg-slate-800 px-3 py-1">
          Back to dashboard
        </Link>
      </div>

      <BillingClient />

      <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
        <div className="font-semibold">Receipts</div>
        <div className="text-sm text-slate-400">
          Receipts are available inside the billing portal once the subscription is active.
        </div>
      </div>
    </div>
  );
}
