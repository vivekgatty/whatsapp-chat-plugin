import { NextResponse } from "next/server";
import * as Admin from "@/lib/supabaseAdmin";

// Primary fallback widget id from your project context
const FALLBACK_WIDGET_ID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

function getAdminClient(): any {
  const f =
    (Admin as any).supabaseAdmin ??
    (Admin as any).getSupabaseAdmin ??
    (Admin as any).createAdminClient ??
    (Admin as any).default;
  if (typeof f !== "function") {
    throw new Error("supabaseAdmin must export a function that returns a Supabase client");
  }
  return f();
}

async function resolveBusinessId(supabase: any): Promise<string> {
  // 1) Env
  const fromEnv =
    process.env.DEFAULT_BUSINESS_ID || process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_ID || "";
  if (fromEnv) return fromEnv;

  // 2) From the fallback widget's business_id
  {
    const { data, error } = await supabase
      .from("widgets")
      .select("business_id")
      .eq("id", FALLBACK_WIDGET_ID)
      .maybeSingle();
    if (error) throw error;
    if (data?.business_id) return data.business_id;
  }

  // 3) Newest widget that already has a business_id
  {
    const { data, error } = await supabase
      .from("widgets")
      .select("business_id")
      .not("business_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    const bid = data?.[0]?.business_id;
    if (bid) return bid;
  }

  // 4) Give a clear error so we know to set DEFAULT_BUSINESS_ID or link a widget
  throw new Error(
    "No business_id resolvable. Set DEFAULT_BUSINESS_ID in env or link a widget to a business."
  );
}

export async function POST() {
  try {
    const supabase = getAdminClient();
    const businessId = await resolveBusinessId(supabase);

    const payload = {
      widget_id: FALLBACK_WIDGET_ID,
      business_id: businessId,
      event: "trigger_fired",
      page: "/dashboard/analytics/triggers",
      meta: {
        reason: "manual_test",
        trigger_code: "test_manual",
        trigger_type: "manual",
        locale: "en",
      },
    };

    const { error } = await supabase.from("analytics").insert(payload);
    if (error) throw error;

    return NextResponse.json({ ok: true, inserted: payload }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}