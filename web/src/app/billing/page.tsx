export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSupabaseServer } from "../lib/supabaseServer";

export default async function BillingPage() {
  // Always guard auth + env to avoid runtime crashes
  let userId: string | null = null;
  try {
    const supa = await getSupabaseServer();
    const { data: { user } } = await supa.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const portalUrl = process.env.RAZORPAY_CUSTOMER_PORTAL_URL || "";
  const hasPortal = portalUrl.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Billing</h1>
        <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 rounded px-3 py-2 text-sm">
          Back to dashboard
        </Link>
      </div>

      {!userId && (
        <div className="rounded border border-slate-700 p-4">
          <div className="font-medium mb-2">You’re not signed in</div>
          <p className="text-slate-300 text-sm">
            Please sign in from the home page, then return to billing.
          </p>
        </div>
      )}

      <div className="rounded border border-slate-700 p-4">
        <div className="font-medium mb-2">Manage subscription</div>
        {hasPortal ? (
          <a
            href={portalUrl}
            target="_blank"
            className="inline-block bg-sky-600 hover:bg-sky-500 rounded px-3 py-2 text-sm"
          >
            Open billing portal
          </a>
        ) : (
          <div className="text-sm text-slate-300">
            Billing isn’t fully configured yet. Ask the site admin to set{" "}
            <code className="px-1 py-0.5 rounded bg-slate-800">RAZORPAY_CUSTOMER_PORTAL_URL</code>{" "}
            in Vercel Project → Settings → Environment Variables.
          </div>
        )}
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="font-medium mb-1">Receipts</div>
        <p className="text-sm text-slate-300">
          When billing is configured, your receipts will be accessible via the billing portal.
        </p>
      </div>
    </div>
  );
}