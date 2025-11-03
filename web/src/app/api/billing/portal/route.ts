import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";
import { createPortalSession, createPortalSessionForEmail } from "../../../../lib/razorpay";

export const runtime = "nodejs";

export async function POST() {
  const supa = await getSupabaseServer();
  const { data: auth } = await supa.auth.getUser();
  if (!auth?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Try DB first (if webhook already populated), else resolve by email.
  const { data: sub } = await supa
    .from("subscriptions")
    .select("razorpay_customer_id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  try {
    const session = sub?.razorpay_customer_id
      ? await createPortalSession(sub.razorpay_customer_id)
      : await createPortalSessionForEmail(
          auth.user.email,
          auth.user.user_metadata?.name as string | undefined
        );

    const url =
      (session && (session.short_url || session.url || session.redirect_url)) ||
      null;

    if (!url) throw new Error("Portal URL not returned");
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}