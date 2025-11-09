export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import React from "react";
import supabaseAdmin from "../../../lib/supabaseAdmin";

type AnyRec = Record<string, any>;
const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STARTER_FREE_QUOTA = 100;
const AUTO_CREATE_IF_ABSENT = true;

// ---------- widget resolution (unchanged intent) ----------
async function ensureStarterWidget(db: ReturnType<typeof supabaseAdmin>) {
  try {
    const { data: existing } = await db
      .from("widgets")
      .select("id")
      .not("business_id", "is", null)
      .limit(1);
    if (existing && existing.length > 0) return String(existing[0].id);

    const { data: biz } = await db
      .from("businesses")
      .insert([{ name: `Starter Business ${new Date().toISOString().slice(0,10)}`, plan: "starter" }])
      .select("id")
      .single();
    if (!biz?.id) return null;

    const { data: widget } = await db
      .from("widgets")
      .insert([{ business_id: biz.id }])
      .select("id")
      .single();
    if (!widget?.id) return null;

    return String(widget.id);
  } catch {
    return null;
  }
}

async function resolveWidgetId(widFromUrl?: string) {
  const db = supabaseAdmin();

  if (widFromUrl && UUID_RE.test(widFromUrl)) {
    const { data: exists } = await db.from("widgets").select("id").eq("id", widFromUrl).maybeSingle();
    if (exists?.id) return widFromUrl;
  }

  const { data: w } = await db
    .from("widgets")
    .select("id,business_id,created_at")
    .not("business_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (w?.id) return String(w.id);

  if (AUTO_CREATE_IF_ABSENT) {
    const createdId = await ensureStarterWidget(db);
    if (createdId) return createdId;
  }
  return FALLBACK_WIDGET;
}

// ---------- data loader with robust free-messages logic ----------
async function fetchOverview(widgetId: string) {
  const db = supabaseAdmin();

  // get widget + business
  let business: AnyRec | null = null;
  try {
    const { data: w } = await db
      .from("widgets")
      .select("id,business_id")
      .eq("id", widgetId)
      .maybeSingle();
    if (w?.business_id) {
      const { data: biz } = await db
        .from("businesses")
        .select("id,name,logo_url,email,plan,subscription_status,free_messages_quota,free_messages_used,free_messages_remaining")
        .eq("id", w.business_id as string)
        .maybeSingle();
      business = biz ?? null;
    }
  } catch {}

  // 7-day tiles
  let daily7: AnyRec[] = [];
  try {
    const { data: d } = await db.rpc("daily_analytics", { p_widget_id: widgetId, p_days: 7 });
    daily7 = Array.isArray(d) ? d : [];
  } catch {}

  const sum = (rows: AnyRec[], k: string) => rows.reduce((acc, r) => acc + (Number(r?.[k]) || 0), 0);
  const totals = {
    impressions: sum(daily7, "impression"),
    opens: sum(daily7, "open"),
    closes: sum(daily7, "close"),
    clicks: sum(daily7, "click"),
    leads: sum(daily7, "leads"),
  };

  // 30-day usage for messages (use "leads" as proxy for "messages")
  let used30 = 0;
  try {
    const { data: d30 } = await db.rpc("daily_analytics", { p_widget_id: widgetId, p_days: 30 });
    const rows = Array.isArray(d30) ? d30 : [];
    used30 = sum(rows, "leads");
  } catch {}

  // Plan + quota logic (server-side, so UI never shows N/A for Starter/Free)
  const planLc = String(business?.plan ?? "starter").toLowerCase();
  const subLc = String(business?.subscription_status ?? "").toLowerCase();
  const isPro = planLc === "pro" || subLc === "active" || subLc === "trialing";

  // Prefer DB values when present; otherwise default 100 for Starter/Free
  let quota =
    Number(business?.free_messages_quota) ||
    Number((business as AnyRec)?.free_message_quota) ||
    (isPro ? 0 : STARTER_FREE_QUOTA);

  // Compute remaining for free tiers; for pro show used only
  const remainingExplicit =
    (business?.free_messages_remaining != null
      ? Number(business.free_messages_remaining)
      : (business as AnyRec)?.free_message_remaining != null
        ? Number((business as AnyRec).free_message_remaining)
        : null);

  const remaining =
    remainingExplicit != null && !Number.isNaN(remainingExplicit)
      ? remainingExplicit
      : Math.max(quota - used30, 0);

  // top pages
  let pages: AnyRec[] = [];
  try {
    const { data: p } = await db.rpc("page_analytics", { p_widget_id: widgetId, p_days: 7 });
    pages = (Array.isArray(p) ? p : []).slice(0, 5);
  } catch {}

  return {
    widgetId,
    plan: isPro ? "pro" : (business?.plan ?? "Starter"),
    business: business
      ? { name: business.name ?? "—", email: business.email ?? "—", logo: business.logo_url ?? "" }
      : { name: "—", email: "—", logo: "" },
    freeMessages: { quota, used30, remaining, isPro },
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

// Next 15: searchParams can be a Promise
export default async function OverviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const widRaw = sp?.wid;
  const wid = Array.isArray(widRaw) ? widRaw[0] : widRaw;

  const widgetId = await resolveWidgetId(wid);
  const data = await fetchOverview(widgetId);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {data.business.logo ? (
          <img src={data.business.logo} alt={data.business.name} className="h-12 w-12 rounded-xl border border-slate-800 object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900" />
        )}
        <div>
          <h1 className="text-xl font-semibold">{data.business.name || "Business"}</h1>
          <div className="text-sm text-slate-400">{data.business.email} • Plan: {data.plan}</div>
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
            data.freeMessages.isPro ? (
              <span>{data.freeMessages.used30}</span>
            ) : (
              <div>
                <div>{`${data.freeMessages.remaining} / ${data.freeMessages.quota}`}</div>
                <a href="/dashboard/billing" className="text-xs underline hover:opacity-80 block mt-1 text-emerald-400">
                  Upgrade to unlimited at ₹199/mo →
                </a>
              </div>
            )
          }
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
    </section>
  );
}
