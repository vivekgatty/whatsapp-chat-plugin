"use client";
import * as React from "react";

type Props = { plan: string; amount: number; buttonText?: string; timeoutMs?: number };

export default function PayButton({
  plan,
  amount,
  buttonText = "Subscribe Pro — ₹1",
  timeoutMs = 120000,
}: Props) {
  const [busy, setBusy] = React.useState(false);

  async function ensureCheckoutJs() {
    if ((window as any).Razorpay) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("checkout.js failed"));
      document.body.appendChild(s);
    });
  }

  async function createOrder() {
    const res = await fetch("/api/billing/order-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, plan }),
    });
    if (!res.ok) throw new Error("order_create_failed");
    return res.json() as Promise<{ ok: boolean; orderId: string; keyId: string }>;
  }

  async function pollUntilPaid(orderId: string) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const r = await fetch(`/api/billing/order-status?order_id=${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (j?.status === "paid") {
          window.location.href = "/pricing?paid=1";
          return;
        }
      } catch {
        /* keep polling */
      }
    }
  }

  async function onClick() {
    try {
      setBusy(true);
      await ensureCheckoutJs();
      const { orderId, keyId } = await createOrder();

      const Razorpay = (window as any).Razorpay;
      const rzp = new Razorpay({
        key: keyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Chatmadi",
        description: `${plan.toUpperCase()} plan`,
        order_id: orderId,
        handler: () => {
          /* Razorpay success callback (for card/intent flows) */
        },
        modal: { ondismiss: () => {} },
        theme: { color: "#0ea5e9" },
      });
      rzp.open();

      // Covers QR-on-mobile flow as well:
      pollUntilPaid(orderId);
    } catch (e) {
      alert("Could not create order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {busy ? "Opening…" : buttonText}
    </button>
  );
}
