"use client";

import { useState } from "react";

interface Props {
  orderId: string;
  amount: number;
}

export function PaymentLinkButton({ orderId, amount }: Props) {
  const [creating, setCreating] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/orders/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount }),
      });
      const data = await res.json();
      if (data.url) setLinkUrl(data.url);
    } finally {
      setCreating(false);
    }
  }

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
      >
        Payment Link Created →
      </a>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={creating}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {creating ? "Creating…" : `Send Payment Link (₹${Number(amount).toLocaleString("en-IN")})`}
    </button>
  );
}
