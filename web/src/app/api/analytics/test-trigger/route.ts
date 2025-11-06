import { NextResponse } from "next/server";
import * as Admin from "@/lib/supabaseAdmin";

const FALLBACK_WIDGET_ID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

export async function POST() {
  try {
    // Accept any of these shapes: {supabaseAdmin}, {getSupabaseAdmin}, {createAdminClient}, default
    const getClient: any =
      (Admin as any).supabaseAdmin ??
      (Admin as any).getSupabaseAdmin ??
      (Admin as any).createAdminClient ??
      (Admin as any).default;

    if (typeof getClient !== "function") {
      throw new Error("supabaseAdmin must export a function that returns a Supabase client");
    }

    const supabase = getClient();

    const payload = {
      widget_id: FALLBACK_WIDGET_ID,
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