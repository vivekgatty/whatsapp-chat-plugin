import { NextResponse } from "next/server";
import * as Admin from "@/lib/supabaseAdmin";

// Resolve an admin client regardless of export style
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

export async function GET(req: Request) {
  try {
    const supabase = getAdminClient();

    const url = new URL(req.url);
    const days = Math.max(1, Math.min(365, Number(url.searchParams.get("days") ?? 30)));
    const limit = Math.max(1, Math.min(1000, Number(url.searchParams.get("limit") ?? 200)));
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Pull rows inserted by the test button and future trigger emissions.
    const { data, error } = await supabase
      .from("analytics")
      .select("created_at,event,event_type,page,meta,locale")
      .gte("created_at", sinceIso)
      .eq("event_type", "trigger")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const items =
      (data ?? []).map((r: any) => {
        const m = r?.meta ?? {};
        return {
          when: r.created_at,
          trigger: m.trigger_code || r.event || "unknown",
          type: m.trigger_type || r.event_type || "trigger",
          why: m.why || "",
          page: r.page || "",
          locale: m.locale || r.locale || "",
        };
      });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}