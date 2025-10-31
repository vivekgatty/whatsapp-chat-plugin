import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const order_id = searchParams.get("order_id");
  if (!order_id) return NextResponse.json({ error: "missing_order_id" }, { status: 400 });

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    return NextResponse.json({ error: "missing_keys" }, { status: 500 });
  }

  const basic = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
  const r = await fetch(`https://api.razorpay.com/v1/orders/${order_id}`, {
    headers: { Authorization: `Basic ${basic}` },
    cache: "no-store",
  });
  const data = await r.json();
  if (!r.ok) {
    return NextResponse.json({ error: "razorpay_error", detail: data }, { status: 502 });
  }

  // data.status: 'created' | 'attempted' | 'paid'
  return NextResponse.json({ ok: true, status: data.status, amount_paid: data.amount_paid ?? 0 });
}
