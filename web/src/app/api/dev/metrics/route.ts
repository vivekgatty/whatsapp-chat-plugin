// src/app/api/dev/metrics/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Row = {
  event: "widget_view" | "chat_click";
  created_at: string;
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function lastNDays(n: number) {
  const out: string[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(ymd(d));
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let businessId = url.searchParams.get("business_id") || "";

    const supabase = createClient();

    // If no business_id is provided, fall back to the first widget's business
    if (!businessId) {
      const { data: w, error: werr } = await supabase
        .from("widgets")
        .select("business_id")
        .limit(1)
        .maybeSingle();

      if (werr) throw werr;
      if (!w?.business_id)
        return NextResponse.json(
          { ok: false, error: "No widgets found to infer business_id" },
          { status: 400 }
        );

      businessId = w.business_id;
    }

    const now = new Date();
    const since = new Date();
    since.setDate(now.getDate() - 7);

    // Pull only recent rows for this business & the two events we care about
    const { data, error } = await supabase
      .from("analytics")
      .select("event, created_at")
      .eq("business_id", businessId)
      .gte("created_at", since.toISOString())
      .in("event", ["widget_view", "chat_click"])
      .limit(10000); // generous cap for dev

    if (error) throw error;

    const rows = (data ?? []) as Row[];

    // Prepare daily buckets
    const days = lastNDays(7);
    const daily: Record<string, { widget_view: number; chat_click: number }> = Object.fromEntries(
      days.map((d) => [d, { widget_view: 0, chat_click: 0 }])
    );

    let totalViews = 0;
    let totalClicks = 0;

    for (const r of rows) {
      const day = ymd(new Date(r.created_at));
      if (!daily[day]) continue; // ignore outside the 7-day window
      if (r.event === "widget_view") {
        daily[day].widget_view += 1;
        totalViews += 1;
      } else if (r.event === "chat_click") {
        daily[day].chat_click += 1;
        totalClicks += 1;
      }
    }

    const dailyArray = days.map((d) => ({
      date: d,
      widget_view: daily[d].widget_view,
      chat_click: daily[d].chat_click,
    }));

    return NextResponse.json({
      ok: true,
      business_id: businessId,
      totals: { widget_view: totalViews, chat_click: totalClicks },
      daily: dailyArray,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
