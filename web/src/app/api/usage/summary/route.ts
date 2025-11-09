import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
const FREE_QUOTA = 100;

// GET /api/usage/summary
export async function GET() {
  try {
    const db = supabaseAdmin;

    // 1) Find newest widget that belongs to a business; fallback to the known primary id
    let widgetId: string = FALLBACK_WIDGET;
    let businessId: string | null = null;

    const { data: w } = await db
      .from("widgets")
      .select("id,business_id,created_at")
      .not("business_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (w?.id) {
      widgetId = w.id as string;
      businessId = (w as any).business_id ?? null;
    }

    // 2) Try to read plan/subscription; default to "starter" if unknown
    let plan = "starter";
    let subscription_status: string | null = null;

    if (businessId) {
      const { data: b } = await db
        .from("businesses")
        .select("plan,subscription_status")
        .eq("id", businessId)
        .maybeSingle();

      if (b?.plan) plan = String(b.plan).toLowerCase();
      if (b?.subscription_status) subscription_status = String(b.subscription_status).toLowerCase();
    }

    const isPro =
      plan === "pro" ||
      plan === "paid" ||
      subscription_status === "active" ||
      subscription_status === "trialing";

    // 3) Sum 30-day usage from your existing RPC (using 'leads' as the proxy for "messages")
    let used = 0;
    const { data: rows } = await db.rpc("daily_analytics", {
      p_widget_id: widgetId,
      p_days: 30,
    });

    if (Array.isArray(rows)) {
      for (const r of rows) used += Number((r as any)?.leads ?? 0);
    }

    const free_quota = isPro ? null : FREE_QUOTA;
    const remaining = free_quota == null ? null : Math.max(free_quota - used, 0);

    return NextResponse.json({
      widgetId,
      plan: isPro ? "pro" : plan || "starter",
      free_quota,
      used,
      remaining,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "usage_summary_failed", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
