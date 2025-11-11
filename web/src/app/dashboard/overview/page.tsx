import UsageCounter from "../../../components/UsageCounter";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* build: 2025-11-11T19:03:12 */

import React from "react";
import { cookies } from "next/headers";
import supabaseAdmin from "../../../lib/supabaseAdmin";

type AnyRec = Record<string, any>;
const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asUuid(s?: string | null): string | null {
  const v = (s || "").trim();
  return UUID_RE.test(v) ? v : null;
}

async function resolveWidgetId(db: any, searchWid?: string | null): Promise<string> {
  // 1) URL param wins
  const fromParam = asUuid(searchWid);
  if (fromParam) return fromParam;

  // 2) Cookie
  try {
    const jar = cookies();
    const cookieWid = asUuid(jar.get("cm_widget_id")?.value || null);
    if (cookieWid) return cookieWid;
  } catch {}

  // 3) Newest widget that has a business_id
  const { data: w } = await db
    .from("widgets")
    .select("id,business_id,created_at")
    .not("business_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (w as AnyRec)?.id ?? FALLBACK_WIDGET;
}

async function fetchOverview(widgetId: string) {
  const db = supabaseAdmin();

  // Business strictly for this widget
  let business: AnyRec | null = null;
  try {
    const { data: w } = await db
      .from("widgets")
      .select("id,business_id")
      .eq("id", widgetId)
      .maybeSingle();

    const businessId = (w as AnyRec)?.business_id ?? null;
    if (businessId) {
      const { data: biz } = await db
        .from("businesses")
        .select(
          "id,name,logo_url,email,plan,free_messages_quota,free_messages_used,free_messages_remaining"
        )
        .eq("id", businessId)
        .maybeSingle();
      business = biz ?? null;
    }
  } catch {
    business = null;
  }

  // Analytics (7d) for this widget
  let daily: AnyRec[] = [];
  try {
    const { data: d } = await db.rpc("daily_analytics", {
      p_widget_id: widgetId,
      p_days: 7,
    });
    daily = Array.isArray(d) ? d : [];
  } catch {
    daily = [];
  }

  const sum = (key: string) => daily.reduce((acc, row) => acc + (Number(row?.[key]) || 0), 0);
  const totals = {
    impressions: sum("impression"),
    opens: sum("open"),
    closes: sum("close"),
    clicks: sum("click"),
    leads: sum("leads"),
  };

  // Top pages (7d)
  let pages: AnyRec[] = [];
  try {
    const { data: p } = await db.rpc("page_analytics", { p_widget_id: widgetId, p_days: 7 });
    pages = (Array.isArray(p) ? p : []).slice(0, 5);
  } catch {
    pages = [];
  }

  // Quota (resilient)
  const quota =
    Number(business?.free_messages_quota) ||
    Number((business as any)?.free_message_quota) ||
    100;

  const used =
    Number(business?.free_messages_used) ||
    Number((business as any)?.free_message_used) ||
    6;

  const remainingExplicit =
    business?.free_messages_remaining != null
      ? Number(business.free_messages_remaining)
      : null;

  const remaining = remainingExplicit != null ? remainingExplicit : Math.max(quota - used, 0);

  return {
    widgetId,
    business: business
      ? { name: business.name ?? "-", email: business.email ?? "-", logo: business.logo_url ?? "", plan: business.plan ?? "Starter" }
      : { name: "-", email: "-", logo: "", plan: "Starter" },
    freeMessages: { quota, used, remaining },
    totals,
    pages,
  };
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

type SearchParams = { wid?: string };

export default async function OverviewPage(
  { searchParams }: { searchParams?: Promise<SearchParams> }
) {
  const sp = searchParams ? await searchParams : undefined;

  const db = supabaseAdmin();
  const widgetId = await resolveWidgetId(db, sp?.wid || null);
  const data = await fetchOverview(widgetId);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {data.business.logo ? (
          <img
            src={data.business.logo}
            alt={data.business.name}
            className="h-12 w-12 rounded-xl border border-slate-800 object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900" />
        )}
        <div>
          <h1 className="text-xl font-semibold">{data.business.name || "Business"}</h1>
          <div className="text-sm text-slate-400">
            {data.business.email} • Plan: {data.business.plan}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat label="Impressions (7d)" value={data.totals.impressions} />
        <Stat label="Opens (7d)" value={data.totals.opens} />
        <Stat label="Clicks (7d)" value={data.totals.clicks} />
      </div>

      {/* Messages + Leads */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Stat label="Leads (7d)" value={data.totals.leads} />
        <Stat
          label="Free messages (remaining)"
          value={${data.freeMessages.remaining} / }
        />
        <Stat label="Widget ID" value={<span className="text-xs">{data.widgetId}</span>} />
      </div>

      {/* Top Pages */}
      <div className="mt-8 rounded-2xl border border-slate-800">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold">Top Pages (7 days)</div>
        <div className="divide-y divide-slate-800">
          {data.pages.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-400">No page data yet.</div>
          ) : (
            data.pages.map((row: AnyRec, i: number) => (
              <div key={i} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm">
                <div className="col-span-8 truncate">{row.page || row.path || row.url || "(unknown)"}</div>
                <div className="col-span-1 text-right">{Number(row.impression ?? row.impressions ?? 0)}</div>
                <div className="col-span-1 text-right">{Number(row.open ?? row.opens ?? 0)}</div>
                <div className="col-span-1 text-right">{Number(row.click ?? row.clicks ?? 0)}</div>
                <div className="col-span-1 text-right">{Number(row.leads ?? 0)}</div>
              </div>
            ))
          )}
        </div>
        {data.pages.length > 0 && (
          <div className="px-4 pb-3 pt-2 text-xs text-slate-500">Columns: page • impressions • opens • clicks • leads</div>
        )}
      </div>

      <UsageCounter />
    </section>
  );
}