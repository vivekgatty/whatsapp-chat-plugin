import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { amount, plan = "pro" } = await req.json().catch(() => ({}));
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "missing_keys" }, { status: 500 });
    }

    // -------------- Build a short receipt (<= 40 chars) --------------
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2, 6);
    let receipt = `p-${plan}-${ts}-${rnd}`;
    receipt = receipt.slice(0, 40);

    const basic = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        receipt,
        notes: { plan },
        payment_capture: 1,
      }),
      cache: "no-store",
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: "razorpay_error", detail: data }, { status: 502 });
    }

    return NextResponse.json({ ok: true, orderId: data.id, keyId: key_id });
  } catch (e) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
