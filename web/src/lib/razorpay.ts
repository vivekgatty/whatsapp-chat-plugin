const keyId = process.env.RAZORPAY_KEY_ID!;
const keySec = process.env.RAZORPAY_KEY_SECRET!;
const auth = "Basic " + Buffer.from(`${keyId}:${keySec}`).toString("base64");

async function rp(path: string, init: RequestInit = {}) {
  const url = `https://api.razorpay.com/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Razorpay ${res.status}: ${t || res.statusText}`);
  }
  return res.json();
}

export async function createCustomerIfNeeded(email: string, name?: string) {
  return rp("/customers", { method: "POST", body: JSON.stringify({ email, name }) });
}

export async function createSubscription(customer_id: string, plan_id: string) {
  return rp("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer_id,
      plan_id,
      total_count: 12,
      notes: { source: "chatmadi" },
    }),
  });
}

export async function createPortalSession(customer_id: string) {
  return rp(`/customers/${customer_id}/portal_sessions`, {
    method: "POST",
    body: JSON.stringify({
      customer_id,
      redirect_url: process.env.NEXT_PUBLIC_BASE_URL || "https://chatmadi.com",
    }),
  });
}
