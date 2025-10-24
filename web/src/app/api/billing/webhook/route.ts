import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs"; // ensure Node runtime for crypto

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ ok: false, error: "Missing RAZORPAY_WEBHOOK_SECRET" }, { status: 500 });
    }

    // Get raw body to verify signature
    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(raw);

    // You can switch on payload.event if needed:
    // e.g. "payment.captured", "order.paid", etc.
    // For now, just acknowledge success.
    // TODO: persist to DB if you want (payments/subscriptions).

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Webhook error" }, { status: 500 });
  }
}
