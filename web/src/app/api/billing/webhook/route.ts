import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

// server-only client (bypass RLS)
const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function hmacMatches(secret: string, body: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text(); // RAW body required for HMAC
  const sig = req.headers.get("x-razorpay-signature");

  if (!WEBHOOK_SECRET) {
    console.error("Missing RAZORPAY_WEBHOOK_SECRET");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // verify
  if (!hmacMatches(WEBHOOK_SECRET, bodyText, sig)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  const evt = JSON.parse(bodyText);

  const event = String(evt?.event || "");
  const payment = evt?.payload?.payment?.entity || null;
  const order = evt?.payload?.order?.entity || null;

  // find business_id from notes on payment or order
  const business_id =
    payment?.notes?.business_id ||
    order?.notes?.business_id ||
    "unknown-business";

  // normalize fields
  const order_id = payment?.order_id || order?.id || null;
  const payment_id = payment?.id || null;
  const amount = payment?.amount || order?.amount || 0;
  const currency = payment?.currency || order?.currency || "INR";
  const status =
    payment?.status ||
    (event === "order.paid" ? "paid" : event || "created");

  // record payment (idempotent on order_id)
  if (order_id) {
    await sb
      .from("payments")
      .upsert(
        {
          business_id,
          amount,
          currency,
          order_id,
          payment_id,
          signature: sig || null,
          status,
          event,
          raw: evt,
        },
        { onConflict: "order_id" }
      )
      .throwOnError();
  }

  // activate/extend subscription to Pro for 30 days on success events
  const isSuccess =
    status === "captured" ||
    status === "paid" ||
    event === "order.paid" ||
    event === "payment.captured";

  if (isSuccess && business_id && business_id !== "unknown-business") {
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await sb
      .from("subscriptions")
      .upsert(
        {
          business_id,
          plan: "pro",
          status: "active",
          current_period_end: currentPeriodEnd,
        },
        { onConflict: "business_id" }
      )
      .throwOnError();
  }

  return NextResponse.json({ ok: true });
}
