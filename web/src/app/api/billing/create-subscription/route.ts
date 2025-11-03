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

    // Accept either server or public names for safety
    const planId =
      process.env.RAZORPAY_PLAN_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID || "";

    const publicKey =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID || "";

    const missing: string[] = [];
    if (!planId) missing.push("RAZORPAY_PLAN_ID");
    if (!publicKey) missing.push("NEXT_PUBLIC_RAZORPAY_KEY_ID/RAZORPAY_KEY_ID");
    if (missing.length) {
      return NextResponse.json(
        { error: `Razorpay env missing: ${missing.join(", ")}` },
        { status: 500 }
      );
    }

    const name =
      (auth.user.user_metadata && (auth.user.user_metadata.name as string)) ||
      "Chatmadi User";

    // Idempotent helper handles "Customer already exists" gracefully
    const customer = await createCustomerIfNeeded(auth.user.email, name);
    const sub = await createSubscription(customer.id, planId);

    return NextResponse.json({
      key: publicKey,
      subscription_id: sub.id,
      customer_id: customer.id,
      email: auth.user.email,
      name,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "create-subscription failed" },
      { status: 500 }
    );
  }
}