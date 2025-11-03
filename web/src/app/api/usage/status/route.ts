import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

const FREE_LIMIT = 100;

export async function GET() {
  const supa = await getSupabaseServer();
  const { data: auth } = await supa.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: sub } = await supa
    .from("subscriptions")
    .select("subscription_status, plan")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const plan = (sub?.subscription_status || "").toLowerCase().startsWith("active") ? "pro" : "free";

  const { data: usage } = await supa
    .from("usage_counters")
    .select("n")
    .eq("user_id", auth.user.id)
    .eq("kind", "message")
    .gte("day", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10));

  const used = (usage || []).reduce((a: any, r: any) => a + (r.n || 0), 0);
  const limit = plan === "pro" ? Number.MAX_SAFE_INTEGER : FREE_LIMIT;

  return NextResponse.json({ plan, used, limit, ok: used < limit });
}
