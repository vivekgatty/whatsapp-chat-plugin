"use client";

import Link from "next/link";

function loadCheckoutScript() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve as any;
    s.onerror = reject as any;
    document.body.appendChild(s);
  });
}

async function openCheckout() {
  const res = await fetch("/api/billing/create-subscription", { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    alert(data?.error || "Failed to start checkout");
    return;
  }
  await loadCheckoutScript();
  // @ts-ignore
  const rzp = new window.Razorpay({
    key: data.key,
    subscription_id: data.subscription_id,
    name: "Chatmadi",
    description: "Pro Plan",
    prefill: { email: data.email, name: data.name },
    theme: { color: "#f59e0b" },
    handler: function () { window.location.href = "/dashboard?upgraded=1"; },
    modal: { ondismiss: function() {} }
  });
  rzp.open();
}

async function openPortal() {
  const res = await fetch("/api/billing/portal", { method: "POST" });
  const data = await res.json();
  if (!res.ok || !data?.url) {
    alert(data?.error || "Could not open billing portal");
    return;
  }
  window.location.href = data.url as string;
}

export default function BillingPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <Link href="/dashboard" className="px-3 py-1 rounded bg-slate-800 border border-slate-700">
          Back to dashboard
        </Link>
      </div>

      <div className="rounded border border-slate-700 bg-slate-900/50 p-4 space-y-2">
        <div className="font-semibold">Manage subscription</div>
        <div className="flex gap-2">
          <button id="upgrade-btn" onClick={() => openCheckout()} className="px-3 py-1 rounded bg-amber-600 text-black">
            Upgrade to Pro
          </button>
          <button onClick={() => openPortal()} className="px-3 py-1 rounded bg-slate-800 border border-slate-700">
            Open billing portal
          </button>
        </div>
        <div className="text-sm text-slate-400">
          This opens Razorpay Checkout for subscription. Portal is for managing an existing subscription.
        </div>
      </div>

      <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
        <div className="font-semibold">Receipts</div>
        <div className="text-sm text-slate-400">Receipts are available inside the billing portal once the subscription is active.</div>
      </div>
    </div>
  );
}