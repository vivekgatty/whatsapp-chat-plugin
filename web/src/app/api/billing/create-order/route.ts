import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY_ID = process.env.RAZORPAY_KEY_ID!;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// fallback if the client doesn't send one
const DEFAULT_BUSINESS_ID = process.env.DEFAULT_BUSINESS_ID || "demo-business";

const rzp = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

type Body = {
  business_id?: string;
  plan?: "pro";
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const business_id = String(body.business_id || DEFAULT_BUSINESS_ID);

    // 199 INR monthly (in paise)
    const amountPaise = 19900;

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `biz_${business_id}_${Date.now()}`,
      notes: { business_id },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: KEY_ID,
      successUrl: `${SITE_URL}/billing/success?order_id=${order.id}`,
      failureUrl: `${SITE_URL}/billing/failed?order_id=${order.id}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
