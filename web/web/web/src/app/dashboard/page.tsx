"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function startCheckout() {
    try {
      setLoading(true);
      setError(null);

      // Create an order on our server (LIVE keys are used server-side)
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          planCode: "pro_monthly",
          amountInPaise: 100, // ₹1.00 during testing
          // business_id: "optional-pass-through"
        }),
      }).then(r => r.json());

      if (!res?.ok) {
        setError(res?.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const { order, key } = res;

      const options = {
        key,
        amount: order.amount,       // paise
        currency: order.currency,   // "INR"
        name: "WhatsApp Chat Plugin",
        description: "Pro Plan — Monthly (TEST ₹1)",
        order_id: order.id,
        notes: order.notes || {},
        prefill: { email: "", contact: "" }, // optional
        theme: { color: "#10b981" },
        handler: function (response: any) {
          // We'll wire real verification via webhook next.
          const q = new URLSearchParams({
            order_id: order.id,
            payment_id: response.razorpay_payment_id || "",
            signature: response.razorpay_signature || "",
          });
          window.location.href = `/billing/success?${q.toString()}`;
        },
        modal: {
          ondismiss: function () {
            window.location.href = `/billing/failed?order_id=${order.id}`;
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (e: any) {
      setError(e.message || String(e));
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Razorpay Checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {/* This button is the "Billing option in the dashboard" */}
        <button
          onClick={startCheckout}
          disabled={loading}
          className="rounded-xl px-4 py-2 bg-emerald-600 text-white disabled:opacity-60"
        >
          {loading ? "Starting…" : "Pay ₹1.00 (Test)"}
        </button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/dashboard/widget"
          className="block rounded-2xl p-5 border border-gray-200 hover:border-emerald-300 transition"
        >
          <div className="text-lg font-medium">Widget Settings</div>
          <div className="text-sm text-gray-600 mt-1">Configure CTA, color, icon, prefill, prechat</div>
        </a>

        <a
          href="/businessprofile"
          className="block rounded-2xl p-5 border border-gray-200 hover:border-emerald-300 transition"
        >
          <div className="text-lg font-medium">Business Profile</div>
          <div className="text-sm text-gray-600 mt-1">WhatsApp number, timezone, working hours</div>
        </a>
      </div>

      {/* Inline billing section with "Back to Dashboard" note */}
      <div className="rounded-2xl p-5 border border-gray-200">
        <div className="text-lg font-medium">Billing</div>
        <div className="text-sm text-gray-600 mt-1">
          You’re in <b>LIVE</b> mode. For testing we charge <b>₹1.00</b>. We’ll switch to the real amount later.
        </div>
        <div className="mt-3">
          <button
            onClick={startCheckout}
            disabled={loading}
            className="rounded-xl px-4 py-2 bg-emerald-600 text-white disabled:opacity-60"
          >
            {loading ? "Starting…" : "Pay ₹1.00 (Test)"}
          </button>
        </div>
        {/* "Back to dashboard" is moot here because you're already on /dashboard.
            When we add a dedicated /dashboard/billing page, it will include a Back to Dashboard link. */}
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
