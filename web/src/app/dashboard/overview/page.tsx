export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import React from "react";
// IMPORTANT: default import; your repo exports a function that returns the admin client
import supabaseAdmin from "../../../lib/supabaseAdmin";

type AnyRec = Record<string, any>;

async function fetchOverview() {
  const supabase = supabaseAdmin();

  // 1) Newest widget with a business, else fallback
  const { data: w } = await supabase
    .from("widgets")
    .select("id,business_id,created_at")
    .not("business_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
  const widgetId: string = (w as AnyRec)?.id ?? FALLBACK_WIDGET;
  const businessId: string | null = (w as AnyRec)?.business_id ?? null;

  // 2) Business profile (name, logo, email, plan)
  let business: AnyRec | null = null;
  if (businessId) {
    const { data: biz } = await supabase
      .from("businesses")
      .select("id,name,logo_url,email,plan,free_messages_quota,free_message_quota,free_messages_used,free_message_used,free_messages_remaining,free_message_remaining")
      .eq("id", businessId)
      .maybeSingle();
    business = biz ?? null;
  }

  const planRaw = String(business?.plan ?? "Starter");
  const planLc = planRaw.toLowerCase();
  const isPro = planLc.includes("pro") || planLc.includes("paid");

  // 3) Analytics (7 days)
  let daily: AnyRec[] = [];
  try {
    const { data: d } = await supabase.rpc("daily_analytics", {
      p_widget_id: widgetId,
      p_days: 7,
    });
    daily = Array.isArray(d) ? d : [];
  } catch (_) {
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

  // 4) Top pages (7 days)
  let pages: AnyRec[] = [];
  try {
    const { data: p } = await supabase.rpc("page_analytics", {
      p_widget_id: widgetId,
      p_days: 7,
    });
    pages = (Array.isArray(p) ? p : []).slice(0, 5);
  } catch (_) {
    pages = [];
  }

  // 5) Free messages (robust to various column names)
  let quota =
    Number(business?.free_messages_quota ?? business?.free_message_quota);
  if (!Number.isFinite(quota) || quota < 0) quota = 0;
  if (!isPro && quota === 0) quota = 100; // default Starter/Free quota

  let used =
    Number(business?.free_messages_used ?? business?.free_message_used);
  if (!Number.isFinite(used) || used < 0) used = 0;

  let remainingExplicit =
    business?.free_messages_remaining ?? business?.free_message_remaining;
  let remaining =
    remainingExplicit != null && Number.isFinite(Number(remainingExplicit))
      ? Math.max(0, Number(remainingExplicit))
      : (isPro ? null : Math.max(0, quota - used));

  return {
    widgetId,
    business: business
      ? {
          name: business.name ?? "—",
          email: business.email ?? "—",
          logo: business.logo_url ?? "",
          plan: planRaw,
        }
      : { name: "—", email: "—", logo: "", plan: planRaw },
    freeMessages: {
      quota,
      used,
      remaining, // may be null for pro
      isPro,
    },
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

export default async function OverviewPage() {
  const data = await fetchOverview();

  const msgValue = data.freeMessages.isPro
    ? `${data.freeMessages.used} this month`
    : `${(data.freeMessages.remaining ?? 0)} / ${data.freeMessages.quota}`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {/* Header — Business Summary */}
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
          <h1 className="text-xl font-semibold">
            {data.business.name || "Business"}
          </h1>
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
          value={
            <>
              <span>{msgValue}</span>
              {!data.freeMessages.isPro && (
                <a
                  href="/dashboard/billing"
                  className="block text-xs font-normal text-emerald-400 underline mt-1"
                >
                  Upgrade to unlimited at ₹199/mo →
                </a>
              )}
            </>
          }
        />
        <Stat label="Widget ID" value={<span className="text-xs">{data.widgetId}</span>} />
      </div>

      {/* Top Pages */}
      <div className="mt-8 rounded-2xl border border-slate-800">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold">
          Top Pages (7 days)
        </div>
        <div className="divide-y divide-slate-800">
          {data.pages.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-400">No page data yet.</div>
          ) : (
            data.pages.map((row: AnyRec, i: number) => (
              <div key={i} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm">
                <div className="col-span-8 truncate">
                  {row.page || row.path || row.url || "(unknown)"}
                </div>
                <div className="col-span-1 text-right">{Number(row.impression ?? row.impressions ?? 0)}</div>
                <div className="col-span-1 text-right">{Number(row.open ?? row.opens ?? 0)}</div>
                <div className="col-span-1 text-right">{Number(row.click ?? row.clicks ?? 0)}</div>
                <div className="col-span-1 text-right">{Number(row.leads ?? 0)}</div>
              </div>
            ))
          )}
        </div>
        {data.pages.length > 0 && (
          <div className="px-4 pb-3 pt-2 text-xs text-slate-500">
            Columns: page • impressions • opens • clicks • leads
          </div>
        )}
      </div>
    </section>
  );
}
