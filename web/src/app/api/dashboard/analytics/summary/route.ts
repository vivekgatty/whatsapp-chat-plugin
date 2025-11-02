export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../../lib/supabaseServer";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

function clampDays(sp: URLSearchParams) {
  const raw = sp.get("days");
  const d = parseInt(raw ?? "14", 10);
  if (!Number.isFinite(d) || d <= 0) return 14;
  return Math.min(d, 90);
}

export async function GET(req: NextRequest) {
  try {
    const supa = await getSupabaseServer();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    let widgetId = url.searchParams.get("wid") ?? null;

    // Pick the newest widget if wid not provided
    if (!widgetId) {
      const { data: w } = await supa
        .from("widgets")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (w?.id) widgetId = w.id as string;
    }
    if (!widgetId) {
      return NextResponse.json({ ok: true, widget_id: null, totals: null, daily: [], by_page: [] });
    }

    const days = clampDays(url.searchParams);

    const { data: daily, error: e1 } = await supabaseAdmin.rpc("daily_analytics", { p_widget_id: widgetId, p_days: days });
    const { data: by_page, error: e2 } = await supabaseAdmin.rpc("page_analytics",  { p_widget_id: widgetId, p_days: days });
    if (e1) console.warn("daily_analytics error", e1);
    if (e2) console.warn("page_analytics error", e2);

    const sum = (arr: any[] | null | undefined, key: string) => (arr ?? []).reduce((a, r) => a + (r?.[key] ?? 0), 0);

    const totals = {
      impressions: sum(daily, "impressions"),
      opens:       sum(daily, "opens"),
      closes:      sum(daily, "closes"),
      clicks:      sum(daily, "clicks"),
      leads:       sum(daily, "leads"),
    };

    return NextResponse.json({ ok: true, widget_id: widgetId, days, totals, daily: daily ?? [], by_page: by_page ?? [] });
  } catch (e: any) {
    console.warn("GET /api/dashboard/analytics/summary", e?.message || e);
    return NextResponse.json({ ok: false, error: "unexpected_error" }, { status: 500 });
  }
}