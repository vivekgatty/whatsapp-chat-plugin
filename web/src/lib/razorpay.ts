const keyId  = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const keySec = process.env.RAZORPAY_KEY_SECRET!;
const auth   = 'Basic ' + Buffer.from(`${keyId}:${keySec}`).toString('base64');

async function rp(path: string, init: RequestInit = {}) {
  const url = `https://api.razorpay.com/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    let desc = txt || res.statusText;
    try {
      const j = JSON.parse(txt);
      desc = j?.error?.description || j?.message || desc;
    } catch {}
    const e: any = new Error(`Razorpay ${res.status}: ${desc}`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

// Best-effort email lookup (Razorpay supports filtering on /customers)
export async function findCustomerByEmail(email: string) {
  try {
    const qs = new URLSearchParams({ email, count: '1' }).toString();
    const out: any = await rp(`/customers?${qs}`, { method: 'GET' });
    const items = out?.items ?? out?.data ?? [];
    return items[0] || null;
  } catch {
    return null;
  }
}

// Idempotent: reuse if exists, else create; if "already exists" 400, re-fetch and return.
export async function ensureCustomer(email: string, name?: string) {
  const existing = await findCustomerByEmail(email);
  if (existing) return existing;
  try {
    return await rp('/customers', { method: 'POST', body: JSON.stringify({ email, name }) });
  } catch (e: any) {
    if ((e?.message || '').includes('Customer already exists')) {
      const again = await findCustomerByEmail(email);
      if (again) return again;
    }
    throw e;
  }
}

export async function createSubscription(customer_id: string, plan_id: string) {
  return rp('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer_id,
      plan_id,
      total_count: 12,
      notes: { source: 'chatmadi' },
    }),
  });
}

export async function createPortalSession(customer_id: string) {
  return rp(`/customers/${customer_id}/portal_sessions`, {
    method: 'POST',
    body: JSON.stringify({
      customer_id,
      redirect_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://chatmadi.com',
    }),
  });
}

// Convenience: open portal by email (resolves/creates customer transparently)
export async function createPortalSessionForEmail(email: string, name?: string) {
  const c = await ensureCustomer(email, name);
  return createPortalSession(c.id);
}

// Back-compat export name used in previous code
export { ensureCustomer as createCustomerIfNeeded };