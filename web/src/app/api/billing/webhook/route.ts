import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** stamp: 2025-10-31_17-07-09 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok:false, error:"missing_webhook_secret" }, { status: 500 });

  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (digest !== sig) return NextResponse.json({ ok:false, error:"bad_signature" }, { status: 400 });

  const event = JSON.parse(raw);
  try {
    // Handle both 'payment.captured' and 'order.paid'
    let userId: string | undefined;
    let orderId: string | undefined;
    let paymentId: string | undefined;
    let amount: number | undefined;

    if (event?.event === "payment.captured" || event?.event === "payment.authorized") {
      const p = event.payload?.payment?.entity;
      orderId   = p?.order_id;
      paymentId = p?.id;
      amount    = p?.amount;
      userId    = p?.notes?.user_id;
    } else if (event?.event === "order.paid") {
      const o = event.payload?.order?.entity;
      orderId = o?.id;
      amount  = o?.amount_paid;
      userId  = o?.notes?.user_id;
    }

    if (!userId) return NextResponse.json({ ok:true, info:"no_user_in_notes" });
    const supabase = getSupabaseAdmin();

    // Flip the user to pro
    await supabase
      .from("profiles")
      .update({ plan: "pro", subscription_status: "active" })
      .eq("id", userId);

    // (Optional) persist a payment row if you have a table:
    // await supabase.from("payments").insert({ user_id: userId, order_id: orderId, payment_id: paymentId, amount });

    return NextResponse.json({ ok:true });
  } catch (e) {
    return NextResponse.json({ ok:false, error:"webhook_handler_error" }, { status: 500 });
  }
}
