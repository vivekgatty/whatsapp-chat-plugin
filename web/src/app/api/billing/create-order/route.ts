import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid any caching

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { amount = 1, plan = "pro" } = await req.json().catch(() => ({ amount: 1, plan: "pro" }));

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("Missing Razorpay env", { has_key_id: !!key_id, has_key_secret: !!key_secret });
      return NextResponse.json(
        { error: "missing_razorpay_keys", has_key_id: !!key_id, has_key_secret: !!key_secret },
        { status: 500 }
      );
    }

    const body = {
      amount: Math.max(1, Math.round(Number(amount))) * 100, // INR paise
      currency: "INR",
      receipt: `order_${user.id}_${Date.now()}`,
      notes: { user_id: user.id, email: user.email ?? "", plan },
    };

    const basic = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await r.text();
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { raw }; }

    if (!r.ok) {
      console.error("Razorpay /orders failed", { status: r.status, data });
      return NextResponse.json({ error: "razorpay_error", status: r.status, detail: data }, { status: 502 });
    }

    // success: return public key and order object for Checkout
    return NextResponse.json({ key_id, order: data });
  } catch (e: any) {
    console.error("create-order error", e);
    return NextResponse.json({ error: "server_error", message: e?.message ?? String(e) }, { status: 500 });
  }
}
