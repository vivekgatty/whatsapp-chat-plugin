import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";

// Always <= 40 chars
function makeShortReceipt(userId: string | null | undefined) {
  const uid = (userId ?? "u").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
  const t = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return (`cm_${uid}_${t}_${rnd}`).slice(0, 40);
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { amount = 1, plan = "pro" } = await req.json().catch(() => ({ amount: 1, plan: "pro" }));
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "missing_razorpay_keys" }, { status: 500 });
    }

    const body = {
      amount: Math.max(1, Math.round(Number(amount))) * 100, // paise
      currency: "INR",
      receipt: makeShortReceipt(user.id),                    // <= 40 chars guaranteed
      notes: { user_id: user.id, email: user.email ?? "", plan },
    };

    const basic = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": `Basic ${basic}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    if (!r.ok) {
      // Bubble up Razorpay’s message so you can see the real reason in the browser alert
      return NextResponse.json({ error: "razorpay_error", detail: data }, { status: 502 });
    }

    return NextResponse.json({ key_id, order: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: "server_error", message: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
