import { NextResponse } from "next/server";
import * as Admin from "@/lib/supabaseAdmin";

const FALLBACK_WIDGET_ID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

// Find an admin client regardless of export style in supabaseAdmin.ts
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

// Resolve a business_id (env → widget fallback → newest linked widget)
async function resolveBusinessId(supabase: any): Promise<string> {
  const fromEnv =
    process.env.DEFAULT_BUSINESS_ID || process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_ID || "";
  if (fromEnv) return fromEnv;

  const { data: wById, error: e1 } = await supabase
    .from("widgets")
    .select("business_id")
    .eq("id", FALLBACK_WIDGET_ID)
    .maybeSingle();
  if (e1) throw e1;
  if (wById?.business_id) return wById.business_id;

  const { data: wAny, error: e2 } = await supabase
    .from("widgets")
    .select("business_id")
    .not("business_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);
  if (e2) throw e2;
  const bid = wAny?.[0]?.business_id;
  if (bid) return bid;

  throw new Error(
    "No business_id resolvable. Set DEFAULT_BUSINESS_ID or link a widget to a business."
  );
}

export async function POST() {
  try {
    const supabase = getAdminClient();
    const businessId = await resolveBusinessId(supabase);

    // Try a list of events commonly allowed by analytics_event_check
    const candidates = ["chat_click", "widget_view", "widget_open", "chat_open"];

    for (const ev of candidates) {
      const payload = {
        widget_id: FALLBACK_WIDGET_ID,
        business_id: businessId,
        event: ev,                // must satisfy analytics_event_check
        event_type: "trigger",    // our tag so the Triggers analytics page can filter
        page: "/dashboard/analytics/triggers",
        meta: {
          why: "manual_test_button",
          trigger_code: "test_manual",
          trigger_type: "manual",
          locale: "en",
          note: "emitted from /dashboard/analytics/triggers",
        },
      };

      const { error } = await supabase.from("analytics").insert(payload);

      if (!error) {
        return NextResponse.json({ ok: true, used_event: ev }, { status: 200 });
      }

      // If it is specifically the CHECK constraint, try the next event; otherwise bubble up
      const msg = (error as any)?.message || String(error);
      const isCheck = /check constraint.*analytics_event_check/i.test(msg);
      if (!isCheck) {
        throw error;
      }
      // else continue to next candidate
    }

    throw new Error(
      "analytics_event_check blocked insert for all tried events (chat_click/widget_view/widget_open/chat_open). " +
        "Please update the CHECK list or tell me the allowed values."
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}