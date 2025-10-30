"use client";
import { useState } from "react";

declare global {
  interface Window { Razorpay?: any }
}

async function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay checkout.js"));
    document.body.appendChild(s);
  });
}

export default function PayButton({ plan = "pro", amount = 1 }: { plan?: string; amount?: number }) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    try {
      setBusy(true);
      await loadRazorpay();

      const resp = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, plan }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error("create-order error:", data);
        alert("Could not create order. Check console.");
        return;
      }

      const { key_id, order } = data;
      const rzp = new window.Razorpay({
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Chatmadi",
        description: `Upgrade to ${plan}`,
        notes: order.notes,
        theme: { color: "#10b981" },
        handler: async (result: any) => {
          try {
            const verify = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            });
            const v = await verify.json();
            if (verify.ok && v?.ok) {
              window.location.href = "/pricing?upgraded=1";
            } else {
              alert("Payment verification failed.");
              console.error(v);
            }
          } catch (e) {
            console.error(e);
            alert("Verification error.");
          }
        },
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Checkout failed. See console.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-60"
    >
      {busy ? "Opening…" : `Subscribe Pro — ₹${amount}`}
    </button>
  );
}
