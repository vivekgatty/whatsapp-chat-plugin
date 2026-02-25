export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../../lib/supabaseServer";

import { loadAnalyticsSnapshots } from "@/lib/analyticsSnapshots";
function clampDays(sp: URLSearchParams) {
  const raw = sp.get("days");
  const d = parseInt(raw ?? "14", 10);
  if (!Number.isFinite(d) || d <= 0) return 14;
  return Math.min(d, 90);
}

export async function GET(req: NextRequest) {
  try {
    const supa = await getSupabaseServer();
    const {
      data: { user },
    } = await supa.auth.getUser();
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
    const { daily, by_page } = await loadAnalyticsSnapshots(widgetId, days);

    const sum = (arr: Array<Record<string, unknown>> | null | undefined, key: string) =>
      (arr ?? []).reduce((a, r) => a + Number(r?.[key] ?? 0), 0);

    const totals = {
      impressions: sum(daily, "impressions"),
      opens: sum(daily, "opens"),
      closes: sum(daily, "closes"),
      clicks: sum(daily, "clicks"),
      leads: sum(daily, "leads"),
    };

    return NextResponse.json({
      ok: true,
      widget_id: widgetId,
      days,
      totals,
      daily: daily ?? [],
      by_page: by_page ?? [],
    });
  } catch (e: unknown) {
    console.warn("GET /api/dashboard/analytics/summary", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "unexpected_error" }, { status: 500 });
  }
}
