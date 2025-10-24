export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Razorpay from "razorpay";

type CreateOrderBody = {
  planCode?: string;
  amountInPaise?: number; // e.g., 100 => ₹1.00
  business_id?: string;
};

export async function POST(req: Request) {
  try {
    // Guard: ensure live keys are present
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Razorpay env missing (KEY_ID/KEY_SECRET)" },
        { status: 200 }
      );
    }

    // Parse body (tolerant)
    const body = (await req.json().catch(() => ({}))) as CreateOrderBody;
    const planCode = body.planCode ?? "pro_monthly";

    // TEST default: ₹1.00 (100 paise). We'll bump this later when you confirm.
    const amountInPaise =
      Number.isFinite(body.amountInPaise) && (body.amountInPaise as number) > 0
        ? (body.amountInPaise as number)
        : 100; // ← default ₹1.00

    const business_id = body.business_id ?? "unknown";

    // Create Razorpay client (server-only secret)
    const razorpay = new (Razorpay as any)({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create order on Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaise, // in paise
      currency: "INR",
      receipt: `wcp_${planCode}_${Date.now()}`,
      notes: { planCode, business_id },
    });

    // Return order + public key to client
    return NextResponse.json({
      ok: true,
      order,
      key: process.env.RAZORPAY_KEY_ID, // safe to expose
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
  }
}
