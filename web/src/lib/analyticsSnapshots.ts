import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type DailySnapshot = {
  day: string;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};

type PageSnapshot = {
  page: string;
  impressions: number;
  opens: number;
  closes: number;
  clicks: number;
  leads: number;
};

export async function loadAnalyticsSnapshots(widgetId: string, days: number): Promise<{ daily: DailySnapshot[]; by_page: PageSnapshot[] }> {
  const admin = getSupabaseAdmin();

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data } = await admin
      .from("analytics_daily")
      .select("day,page,impressions,opens,closes,clicks,leads")
      .eq("widget_id", widgetId)
      .gte("day", since)
      .order("day", { ascending: true });

    if (Array.isArray(data) && data.length > 0) {
      const dayMap = new Map<string, DailySnapshot>();
      const pageMap = new Map<string, PageSnapshot>();

      for (const r of data as Array<Record<string, unknown>>) {
        const day = String(r.day || "");
        const page = String(r.page || "(unknown)");
        const impressions = Number(r.impressions || 0);
        const opens = Number(r.opens || 0);
        const closes = Number(r.closes || 0);
        const clicks = Number(r.clicks || 0);
        const leads = Number(r.leads || 0);

        if (!dayMap.has(day)) dayMap.set(day, { day, impressions: 0, opens: 0, closes: 0, clicks: 0, leads: 0 });
        const d = dayMap.get(day)!;
        d.impressions += impressions;
        d.opens += opens;
        d.closes += closes;
        d.clicks += clicks;
        d.leads += leads;

        if (!pageMap.has(page)) pageMap.set(page, { page, impressions: 0, opens: 0, closes: 0, clicks: 0, leads: 0 });
        const p = pageMap.get(page)!;
        p.impressions += impressions;
        p.opens += opens;
        p.closes += closes;
        p.clicks += clicks;
        p.leads += leads;
      }

      return {
        daily: Array.from(dayMap.values()),
        by_page: Array.from(pageMap.values()).sort((a, b) => b.impressions - a.impressions),
      };
    }
  } catch {
    // fallback to RPC
  }

  const { data: daily } = await admin.rpc("daily_analytics", { p_widget_id: widgetId, p_days: days });
  const { data: by_page } = await admin.rpc("page_analytics", { p_widget_id: widgetId, p_days: days });
  return {
    daily: (daily ?? []) as DailySnapshot[],
    by_page: (by_page ?? []) as PageSnapshot[],
  };
}
