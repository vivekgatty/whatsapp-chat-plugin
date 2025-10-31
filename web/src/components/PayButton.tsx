"use client";
import * as React from "react";

type Props = { orderId: string; timeoutMs?: number };

export default function PayButton({ orderId, timeoutMs = 120000 }: Props) {
  React.useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    (async () => {
      const started = Date.now();
      while (!cancelled && (Date.now() - started < timeoutMs)) {
        await new Promise((r) => setTimeout(r, 3000));
        try {
          const res = await fetch(
            `/api/billing/order-status?order_id=${encodeURIComponent(orderId)}`,
            { cache: "no-store" }
          );
          const data = await res.json();
          if (data?.status === "paid") {
            window.location.href = "/pricing?paid=1";
            return;
          }
        } catch {
          // ignore and keep polling
        }
      }
      // optional: indicate timeout
      // window.location.href = "/pricing?timeout=1";
    })();

    return () => { cancelled = true; };
  }, [orderId, timeoutMs]);

  return null; // nothing to render; it just polls after checkout is opened
}
