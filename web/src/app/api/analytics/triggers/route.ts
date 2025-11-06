import { NextResponse } from "next/server";
import * as SA from "../../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function isClient(x: any) {
  return x && typeof x === "object" && typeof x.from === "function";
}

function buildFallback() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
  if (!key) throw new Error("Missing env SUPABASE_SERVICE_ROLE");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Resolve a Supabase admin client regardless of how the module exports it. */
function getAdmin(): any {
  const m: any = SA as any;

  if (isClient(m)) return m;

  if (typeof m === "function") {
    const c = m();
    if (isClient(c)) return c;
  }

  if (m?.default) {
    if (isClient(m.default)) return m.default;
    if (typeof m.default === "function") {
      const c = m.default();
      if (isClient(c)) return c;
    }
  }

  if (m?.admin) {
    if (isClient(m.admin)) return m.admin;
    if (typeof m.admin === "function") {
      const c = m.admin();
      if (isClient(c)) return c;
    }
  }

  if (typeof m?.createAdminClient === "function") {
    const c = m.createAdminClient();
    if (isClient(c)) return c;
  }

  // Fallback to env-based client
  return buildFallback();
}

// GET /api/analytics/triggers?wid=<widget_id>&days=14&limit=100
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wid    = searchParams.get("wid")?.trim()
                || process.env.DEFAULT_WIDGET_ID
                || "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
    const days   = Math.max(1, Math.min(90, parseInt(searchParams.get("days") || "14", 10)));
    const limit  = Math.max(1, Math.min(500, parseInt(searchParams.get("limit") || "100", 10)));

    const sinceISO = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    const sb = getAdmin();
    let q = sb
      .from("analytics")
      .select("id, created_at, event, page, meta, widget_id, business_id")
      .eq("event", "trigger_fired")
      .eq("widget_id", wid)
      .gte("created_at", sinceISO)
      .order("created_at", { ascending: false })
      .limit(limit);

    let { data, error } = await q;

    // If widget_id column/filter doesn't exist in your schema, try business_id fallback.
    if (error) {
      const biz = process.env.DEFAULT_BUSINESS_ID || null;
      if (!biz) throw error;
      const r2 = await sb
        .from("analytics")
        .select("id, created_at, event, page, meta, widget_id, business_id")
        .eq("event", "trigger_fired")
        .eq("business_id", biz)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (r2.error) throw r2.error;
      data = r2.data;
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to list trigger analytics" },
      { status: 500 }
    );
  }
}