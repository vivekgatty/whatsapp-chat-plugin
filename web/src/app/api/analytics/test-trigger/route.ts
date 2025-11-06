import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

// NOTE: Primary fallback widget id from your project context
const FALLBACK_WIDGET_ID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

export async function POST() {
  const sb = supabaseAdmin();

  // Find the newest widget that has a business_id; otherwise use fallback
  let widgetId: string | null = null;
  let businessId: string | null = null;

  try {
    const { data: w } = await sb
      .from("widgets")
      .select("id,business_id,created_at")
      .not("business_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    widgetId = w?.id ?? FALLBACK_WIDGET_ID;
    businessId = w?.business_id ?? null;

    // If still no businessId, try to fetch it from the fallback widget
    if (!businessId && widgetId) {
      const { data: wf } = await sb
        .from("widgets")
        .select("business_id")
        .eq("id", widgetId)
        .maybeSingle();
      businessId = wf?.business_id ?? null;
    }

    const now = new Date();
    const meta = {
      trigger_code: "sales_inquiry",
      trigger_type: "manual_test",
      reason: "manual_test",
      value: "dev",
      locale: "en",
      page: "/dashboard/analytics/triggers",
      referrer: "",
    };

    const { error: insErr } = await sb.from("analytics").insert({
      event: "trigger_fired",
      page: meta.page,
      meta,
      widget_id: widgetId,
      business_id: businessId,
      created_at: now.toISOString(),
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Emit failed" }, { status: 500 });
  }
}