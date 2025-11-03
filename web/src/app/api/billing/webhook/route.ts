import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

function verify(sig: string | null, body: string, secret: string) {
  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return sig === digest;
}

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });

  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature");

  if (!verify(sig, raw, secret))
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const evt = JSON.parse(raw);
  const type: string = evt.event;
  const sub = evt.payload?.subscription?.entity;
  const cust = evt.payload?.customer?.entity;

  if (!sub?.id) return NextResponse.json({ ok: true }); // ignore non-subscription events

  const admin = getSupabaseAdmin();

  const payload = {
    razorpay_subscription_id: sub.id as string,
    razorpay_customer_id: (cust?.id || sub.customer_id) as string,
    plan: sub.plan_id as string,
    subscription_status: (sub.status || type) as string,
    current_period_end: sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null,
  };

  await admin.from("subscriptions").upsert(payload, { onConflict: "razorpay_subscription_id" });

  return NextResponse.json({ ok: true });
}
