export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../../lib/supabaseServer";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";

function clampDays(sp: URLSearchParams) {
  const raw = sp.get("days");
  const d = parseInt(raw ?? "14", 10);
  if (!Number.isFinite(d) || d <= 0) return 14;
  return Math.min(d, 90);
}

function csvLine(fields: (string | number)[]) {
  return fields
    .map((v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

type DailyRow = {
  day: string;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};

type PageRow = {
  page: string;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};

export async function GET(req: NextRequest) {
  try {
    const supa = await getSupabaseServer();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    let widgetId = url.searchParams.get("wid") ?? null;

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
      return new NextResponse("No widget", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    }

    const days = clampDays(url.searchParams);
    const admin = getSupabaseAdmin();

    const { data: daily } = await admin.rpc("daily_analytics", {
      p_widget_id: widgetId,
      p_days: days,
    });
    const { data: by_page } = await admin.rpc("page_analytics", {
      p_widget_id: widgetId,
      p_days: days,
    });

    const lines: string[] = [];
    lines.push("Daily");
    lines.push(csvLine(["day", "impressions", "opens", "closes", "clicks", "leads"]));
    for (const r of (daily ?? []) as DailyRow[]) {
      lines.push(csvLine([r.day, r.impressions, r.opens, r.closes, r.clicks, r.leads]));
    }
    lines.push("");
    lines.push("");

    lines.push("By page");
    lines.push(csvLine(["page", "impressions", "opens", "closes", "clicks", "leads"]));
    for (const r of (by_page ?? []) as PageRow[]) {
      lines.push(csvLine([r.page, r.impressions, r.opens, r.closes, r.clicks, r.leads]));
    }

    const csv = lines.join("\r\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename=analytics_${widgetId}_${days}d.csv`,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "export_error" }, { status: 500 });
  }
}
