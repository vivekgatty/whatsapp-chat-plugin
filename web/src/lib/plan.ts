export type PlanInfo = {
  plan: "free" | "pro";
  limit: number;         // 100 for free, large for pro
  count: number;         // current period usage
  remaining: number;
  period: string;        // YYYYMM
  exceeded: boolean;
};

function periodYYYYMM(d = new Date()) {
  return d.toISOString().slice(0,7).replace("-","");
}

export async function getWidgetAndBusiness(supa: any, widgetId: string) {
  // Try widget with business_id; fallback to widget only
  const { data: w, error: werr } = await supa.from("widgets").select("*").eq("id", widgetId).maybeSingle();
  if (!w || werr) return { widget: null, business: null };
  let business = null;
  if (w.business_id) {
    const { data: b } = await supa.from("businesses").select("*").eq("id", w.business_id).maybeSingle();
    business = b || null;
  }
  return { widget: w, business };
}

export function resolvePlan(business: any): "free" | "pro" {
  const p = (business?.plan || "free").toLowerCase();
  const status = (business?.subscription_status || "").toLowerCase();
  if (p === "pro") return "pro";
  if (["active","trialing"].includes(status)) return "pro";
  return "free";
}

export async function getUsage(supa: any, widgetId: string, kind = "message"): Promise<PlanInfo> {
  const { widget, business } = await getWidgetAndBusiness(supa, widgetId);
  const plan = resolvePlan(business);
  const limit = (plan === "pro") ? 1000000 : 100; // effectively unlimited for pro
  const period = periodYYYYMM();
  let count = 0;

  const { data: row } = await supa
    .from("usage_counters")
    .select("count")
    .eq("widget_id", widgetId)
    .eq("period", period)
    .eq("kind", kind)
    .maybeSingle();

  if (row?.count) count = row.count;

  const exceeded = count >= limit;
  return { plan, limit, count, remaining: Math.max(0, limit - count), period, exceeded };
}

export async function enforceQuotaOrExplain(supa: any, widgetId: string, kind = "message") {
  const info = await getUsage(supa, widgetId, kind);
  if (info.plan === "pro") {
    // increment for record-keeping
    const { error } = await supa.rpc("inc_usage", { p_widget_id: widgetId, p_period: info.period, p_kind: kind });
    return { ok: true, info };
  }
  if (info.count >= info.limit) {
    return { ok: false, info, error: "quota_exceeded" as const };
  }
  // increment
  const { data, error } = await supa.rpc("inc_usage", { p_widget_id: widgetId, p_period: info.period, p_kind: kind });
  if (error) return { ok: false, info, error: "increment_failed" as const };
  const newCount = data ?? (info.count + 1);
  const exceeded = newCount > info.limit;
  return { ok: !exceeded, info: { ...info, count: newCount, remaining: Math.max(0, info.limit - newCount), exceeded } };
}