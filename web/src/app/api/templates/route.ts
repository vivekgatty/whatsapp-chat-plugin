export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../lib/supabaseAdmin";

async function resolveBusinessId(supa: any, wid?: string | null, bid?: string | null) {
  if (bid) return bid;
  if (wid) {
    const { data, error } = await supa.from("widgets").select("business_id").eq("id", wid).maybeSingle();
    if (!error && data?.business_id) return data.business_id as string;
  }
  return process.env.DEFAULT_BUSINESS_ID ?? null;
}

// GET /api/templates?wid=<uuid>&bid=<uuid>&locale=en&kind=greeting
export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const wid = u.searchParams.get("wid");
    const bid = u.searchParams.get("bid");
    const locale = u.searchParams.get("locale");
    const kind = u.searchParams.get("kind");

    const supa = getSupabaseAdmin();
    const business_id = await resolveBusinessId(supa, wid, bid);

    let q = supa.from("templates").select("*").order("created_at", { ascending: false }) as any;
    if (business_id) q = q.eq("business_id", business_id);
    if (locale) q = q.eq("locale", locale);
    if (kind) q = q.eq("kind", kind);

    const { data, error } = await q;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, templates: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}

// POST /api/templates   body: { wid?: string, bid?: string, name, locale, kind, body }
export async function POST(req: NextRequest) {
  try {
    const supa = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));

    const name = (body?.name ?? "").trim();
    const locale = (body?.locale ?? "").trim();
    const kind = (body?.kind ?? "").trim();
    const text = (body?.body ?? "").trim();
    const wid: string | null = (body?.wid ?? "").trim() || null;
    const bid: string | null = (body?.bid ?? "").trim() || null;

    if (!name || !locale || !kind || !text) {
      return NextResponse.json({ ok: false, error: "name, locale, kind, body are required" }, { status: 400 });
    }

    const business_id = await resolveBusinessId(supa, wid, bid);
    const payload: any = { name, locale, kind, body: text };
    if (business_id) payload.business_id = business_id;

    const { data, error } = await supa.from("templates").insert(payload).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, template: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
