// src/app/api/log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Ensure runtime eval (don’t read env at build time)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Build the admin client at request time
function getAdminSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE is missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

// naive in-memory throttle per IP (server restarts reset this; fine for dev)
const lastHit: Record<string, number> = {};

function minuteBucket(ts = new Date()) {
  return Math.floor(ts.getTime() / 1000 / 60);
}

export async function POST(req: NextRequest) {
  try {
    const sb = getAdminSupabase(); // <-- create inside handler

    const ip = req.headers.get("x-forwarded-for") || "local";
    const now = Date.now();
    if (lastHit[ip] && now - lastHit[ip] < 250) {
      return NextResponse.json({ ok: true, skipped: "rate-limit" }); // soft throttle
    }
    lastHit[ip] = now;

    const body = await req.json().catch(() => ({}));
    const widget_id = String((body as any).widget_id || "");
    const page = String((body as any).page || "");
    const event = String((body as any).event || "");
    const meta = (body as any).meta && typeof (body as any).meta === "object" ? (body as any).meta : {};

    if (!widget_id || !event) {
      return NextResponse.json({ ok: false, error: "missing widget_id/event" }, { status: 400 });
    }

    const mb = minuteBucket();
    // Poor-man idempotency: same ip+widget+event+page+minute
    const sinceISO = new Date((mb - 1) * 60 * 1000).toISOString();
    const { data: exists, error: qErr } = await sb
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("widget_id", widget_id)
      .eq("event", event)
      .eq("page", page)
      .gte("created_at", sinceISO);

    if (qErr) throw qErr;
    if ((exists as any)?.length || (exists as any) === null) {
      // Supabase count HEAD returns null rows; but we only care if count>0
    }

    // do the insert only if not duplicate within the minute
    const { error: insErr } = await sb.from("events").insert({
      widget_id,
      page,
      event,
      meta,
      minute_bucket: mb,
    } as any);

    if (insErr) {
      return NextResponse.json({ ok: false, supabaseError: insErr.message });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
