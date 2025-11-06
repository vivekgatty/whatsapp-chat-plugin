import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Primary fallback widget id from your project context
const FALLBACK_WIDGET_ID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
const DEFAULT_BUSINESS_ID = process.env.DEFAULT_BUSINESS_ID || null;

async function emit() {
  const sb = getSupabaseAdmin();

  // Try to find the newest widget with a business_id, else fallback
  const { data: w, error: wErr } = await sb
    .from("widgets")
    .select("id,business_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (wErr) throw new Error(wErr.message);

  const widget_id = w?.id ?? FALLBACK_WIDGET_ID;
  const business_id = w?.business_id ?? DEFAULT_BUSINESS_ID;

  const meta = {
    trigger: "test_manual",
    type: "manual",
    why: "manual_test_button",
    page: "/dashboard/analytics/triggers",
    locale: "en",
  };

  // IMPORTANT: event_type is required by your schema
  const { error: insErr } = await sb.from("analytics").insert({
    widget_id,
    business_id,
    event_type: "trigger",
    event: "trigger_fired",
    page: meta.page,
    meta,
  });

  if (insErr) throw new Error(insErr.message);
}

export async function POST() {
  try {
    await emit();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to emit" }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}