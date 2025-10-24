import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayPage() {
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
    <div className="max-w-xl mx-auto p-6 space-y-4">
      {/* Razorpay Checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <a
          href="/dashboard"
          className="rounded-lg px-3 py-1.5 border border-gray-300 hover:border-emerald-400"
        >
          ← Back to Dashboard
        </a>
      </div>

      <p className="text-sm text-gray-600">
        You’re in <b>LIVE</b> mode. For testing we’ll charge <b>₹1.00</b>. We’ll switch to the real amount after you confirm.
      </p>

      <button
        onClick={startCheckout}
        disabled={loading}
        className="rounded-xl px-4 py-2 bg-emerald-600 text-white disabled:opacity-60"
      >
        {loading ? "Starting…" : "Pay ₹1.00 (Test)"}
      </button>

      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
}
