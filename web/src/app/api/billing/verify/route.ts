import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json().catch(() => ({} as any));

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "missing_secret" }, { status: 500 });

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ ok: false, verified: false }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      await supabase.from("profiles")
        .update({ plan: "pro", subscription_status: "active" })
        .eq("id", user.id);
    }
  } catch (e) {
    console.error("verify: post-update error (non-fatal)", e);
  }

  return NextResponse.json({ ok: true, verified: true });
}
