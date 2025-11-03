"use client";

function loadCheckoutScript() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

async function openCheckout() {
  await loadCheckoutScript();
  const res = await fetch("/api/billing/create-subscription", { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    alert(data?.error || "Failed to start checkout");
    return;
  }

  // @ts-ignore
  const rzp = new window.Razorpay({
    key: data.key,
    subscription_id: data.subscription_id,
    name: "Chatmadi",
    description: "Pro Plan",
    prefill: { email: data.email, name: data.name },
    theme: { color: "#f59e0b" },
    handler: function () {
      window.location.href = "/dashboard?upgraded=1";
    },
    modal: { ondismiss: function () {} },
  });
  rzp.open();
}

export default function BillingClient() {
  return (
    <div className="space-y-2 rounded border border-slate-700 bg-slate-900/50 p-4">
      <div className="font-semibold">Manage subscription</div>
      <div className="flex gap-2">
        <button
          id="upgrade-btn"
          onClick={() => openCheckout()}
          className="rounded bg-amber-600 px-3 py-1 text-black"
        >
          Upgrade to Pro
        </button>

        {/* Replace with real portal link once webhook has customer_id */}
        <a
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Portal link can be enabled once webhook populates customer_id.");
          }}
        >
          Open billing portal
        </a>
      </div>
      <div className="text-sm text-slate-400">
        This opens Razorpay Checkout for subscription. Portal is for managing an existing
        subscription.
      </div>
    </div>
  );
}
