import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Returns recent "trigger_fired" analytics events, shaping fields from meta JSON.
 * Query params:
 *  - days: number of days back (default 30)
 *  - limit: max rows (default 200, max 1000)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = Math.max(1, Math.min(365, Number(url.searchParams.get("days") || 30)));
    const limit = Math.max(1, Math.min(1000, Number(url.searchParams.get("limit") || 200)));
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const sb = supabaseAdmin();
    // Only select columns that definitely exist
    const { data, error } = await sb
      .from("analytics")
      .select("id, created_at, event, page, meta")
      .eq("event", "trigger_fired")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || []).map((r) => {
      const m: any = r?.meta || {};
      return {
        when: r.created_at,
        trigger: m.trigger || m.trigger_code || m.code || "(unknown)",
        type: m.type || m.trigger_type || "manual",
        why: m.why || m.reason || m.via || "",
        page: r.page || m.page || m.referrer || "(unknown)",
        locale: m.locale || m.lang || "",
      };
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}