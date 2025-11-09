import UsageCounter from "../../../components/UsageCounter";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
// IMPORTANT: your project exports default supabaseAdmin()
import supabaseAdmin from "../../../lib/supabaseAdmin";

type AnyRec = Record<string, any>;
const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

/** Resolve logged-in user on the server */
async function getSSRUser() {
  const jar = cookies();
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return jar.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const { data } = await supa.auth.getUser();
  return data?.user ?? null;
}

/** Fallback: newest widget that has a business_id (your current behavior) */
async function fallbackWidgetId(db: any): Promise<string> {
  const { data: w } = await db
    .from("widgets")
    .select("id,business_id,created_at")
    .not("business_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (w as AnyRec)?.id ?? FALLBACK_WIDGET;
}

/** Prefer a per-user widget; auto-create starter business+widget if missing. */
async function resolveWidgetIdForUser(db: any): Promise<string | null> {
  const user = await getSSRUser();
  if (!user?.id) return null;

  // 1) Already has a widget?
  const { data: wExisting, error: wErr } = await db
    .from("widgets")
    .select("id,business_id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!wErr && wExisting?.id) return wExisting.id as string;

  // 2) Find or create a starter business for this user
  let businessId: string | null = null;

  const tryOwner = await db
    .from("businesses")
    .select("id,owner_user_id,email")
    .eq("owner_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (tryOwner?.data?.id) {
    businessId = tryOwner.data.id as string;
  } else if (user.email) {
    const byEmail = await db
      .from("businesses")
      .select("id,email")
      .eq("email", user.email)
      .limit(1)
      .maybeSingle();
    if (byEmail?.data?.id) businessId = byEmail.data.id as string;
  }

  if (!businessId) {
    const friendly = (user.email?.split("@")[0] || "My").replace(/[^a-zA-Z0-9 _.-]/g, "");
    const { data: bNew, error: bErr } = await db
      .from("businesses")
      .insert({
        name: `${friendly}'s Business`,
        email: user.email ?? null,
        plan: "starter",
        owner_user_id: user.id, // ok if column exists
      } as any)
      .select("id")
      .single();

    if (bErr || !bNew?.id) return null;
    businessId = bNew.id as string;
  }

  // 3) Create widget tied to that business
  const { data: wNew, error: wNewErr } = await db
    .from("widgets")
    .insert({ business_id: businessId, owner_user_id: user.id } as any)
    .select("id")
    .single();

  if (wNewErr || !wNew?.id) return null;
  return wNew.id as string;
}

async function fetchOverview() {
  const db = supabaseAdmin();

  // Prefer per-user widget; fall back to previous logic if needed
  const userWidgetId = await resolveWidgetIdForUser(db);
  const widgetId = userWidgetId ?? (await fallbackWidgetId(db));

  // Business profile
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

  // Analytics rollups (7 days)
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

  const sum = (k: string) => daily.reduce((a, r) => a + (Number(r?.[k]) || 0), 0);
  const totals = {
    impressions: sum("impression"),
    opens: sum("open"),
    closes: sum("close"),
    clicks: sum("click"),
    leads: sum("leads"),
  };

  // Top pages (7 days)
  let pages: AnyRec[] = [];
  try {
    const { data: p } = await db.rpc("page_analytics", {
      p_widget_id: widgetId,
      p_days: 7,
    });
    pages = (Array.isArray(p) ? p : []).slice(0, 5);
  } catch {
    pages = [];
  }

  // Free-messages (resilient; preserves your 94/100 style)
  const quota =
    Number((business as AnyRec)?.free_messages_quota) ||
    Number((business as AnyRec)?.free_message_quota) ||
    100;
  const used =
    Number((business as AnyRec)?.free_messages_used) ||
    Number((business as AnyRec)?.free_message_used) ||
    (100 - 94);
  const remainingExplicit =
    (business && (business as AnyRec).free_messages_remaining != null
      ? Number((business as AnyRec).free_messages_remaining)
      : null) ?? null;

  const remaining = remainingExplicit != null ? remainingExplicit : Math.max(quota - used, 0);

  return {
    widgetId,
    business: business
      ? {
          name: business.name ?? "—",
          email: business.email ?? "—",
          logo: business.logo_url ?? "",
          plan: business.plan ?? "Starter",
        }
      : { name: "—", email: "—", logo: "", plan: "Starter" },
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

export default async function OverviewPage() {
  const data = await fetchOverview();

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
          value={
            data.freeMessages.remaining || data.freeMessages.quota
              ? `${data.freeMessages.remaining} / ${data.freeMessages.quota || "—"}`
              : "N/A"
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
                <div className="col-span-1 text-right">
                  {Number(row.impression ?? row.impressions ?? 0)}
                </div>
                <div className="col-span-1 text-right">
                  {Number(row.open ?? row.opens ?? 0)}
                </div>
                <div className="col-span-1 text-right">
                  {Number(row.click ?? row.clicks ?? 0)}
                </div>
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

      <UsageCounter />
    </section>
  );
}