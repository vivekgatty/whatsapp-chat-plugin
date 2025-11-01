export const dynamic = "force-dynamic";
/** stamp: 2025-11-01_07-28-06 */
async function fetchPayments() {
  const r = await fetch("/api/billing/list", { cache: "no-store" });
  return r.json();
}
export default async function BillingPage() {
  const res = await fetchPayments();
  const items: any[] = res?.items ?? [];
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>
      {items.length === 0 ? (
        <div className="text-slate-300">No invoices yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.razorpay_payment_id ?? p.id} className="rounded border border-slate-700 p-3 text-sm text-slate-200">
              <div className="font-medium">{(p.amount / 100).toFixed(2)} {p.currency ?? "INR"}</div>
              <div className="opacity-70">Payment ID: {p.razorpay_payment_id ?? "-"}</div>
              <div className="opacity-70">Status: {p.status}</div>
              <div className="opacity-70">Created: {p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}