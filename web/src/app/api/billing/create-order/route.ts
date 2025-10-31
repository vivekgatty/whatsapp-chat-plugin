import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toPaise(n: unknown) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 100; // ₹1
  // round to 2 decimals then paise
  return Math.max(100, Math.round(Math.round(v * 100))); // min ₹1 => 100 paise
}

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export async function POST(req: Request) {
  try {
    // (Auth is nice-to-have; don’t block order creation if cookie missing)
    let userId = "anonymous";
    let userEmail = "";
    try {
      const supabase = await getSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) { userId = user.id; userEmail = user.email ?? ""; }
    } catch {}

    const bodyIn = await req.json().catch(() => ({ amount: 1, plan: "pro" }));
    const amountPaise = toPaise(bodyIn.amount);
    const plan = (bodyIn.plan ?? "pro") as string;

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "missing_razorpay_keys" }, { status: 500 });
    }

    const orderPayload = {
      amount: amountPaise,
      currency: "INR",
      receipt: `order_${userId}_${Date.now()}`,
      notes: { user_id: userId, email: userEmail, plan },
    };

    const basic = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      const detail = safeJson(text);
      // surface Razorpay's message (usually at detail.error.description)
      return NextResponse.json(
        { error: "razorpay_error", status: r.status, detail },
        { status: 502 }
      );
    }

    const data = await r.json();
    return NextResponse.json({ key_id, order: data });
  } catch (e) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
