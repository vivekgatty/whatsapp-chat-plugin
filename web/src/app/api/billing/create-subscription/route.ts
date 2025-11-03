import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";
import { createCustomerIfNeeded, createSubscription } from "../../../../lib/razorpay";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supa = await getSupabaseServer();
    const { data: auth } = await supa.auth.getUser();
    if (!auth?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!planId || !publicKey) {
      return NextResponse.json({ error: "Razorpay env missing" }, { status: 500 });
    }

    const customer = await createCustomerIfNeeded(auth.user.email, auth.user.user_metadata?.name);
    const sub = await createSubscription(customer.id, planId);

    return NextResponse.json({
      key: publicKey,
      subscription_id: sub.id,
      customer_id: customer.id,
      email: auth.user.email,
      name: auth.user.user_metadata?.name || "Chatmadi User",
    });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "create-subscription failed" }, { status: 500 });
  }
}