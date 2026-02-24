export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../lib/supabaseAdmin";
import { requireApiSession, userCanAccessBusiness, userCanAccessWidget } from "@/lib/apiAuth";
import { sanitizeText } from "@/lib/utils/sanitize";

async function resolveBusinessId(supa: ReturnType<typeof getSupabaseAdmin>, wid?: string | null, bid?: string | null) {
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

    const user = await requireApiSession();
    if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const supa = getSupabaseAdmin();
    const business_id = await resolveBusinessId(supa, wid, bid);

    if (wid && !(await userCanAccessWidget(user.id, wid))) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    if (business_id && !(await userCanAccessBusiness(user.id, business_id))) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    let q = supa.from("templates").select("*").order("created_at", { ascending: false });
    if (business_id) q = q.eq("business_id", business_id);
    if (locale) q = q.eq("locale", locale);
    if (kind) q = q.eq("kind", kind);

    const { data, error } = await q;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, templates: data ?? [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// POST /api/templates   body: { wid?: string, bid?: string, name, locale, kind, body }
export async function POST(req: NextRequest) {
  try {
    const user = await requireApiSession();
    if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const supa = getSupabaseAdmin();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const name = sanitizeText(body?.name, 120);
    const locale = sanitizeText(body?.locale, 16);
    const kind = sanitizeText(body?.kind, 40);
    const text = sanitizeText(body?.body, 2000);
    const wid = sanitizeText(body?.wid, 60) || null;
    const bid = sanitizeText(body?.bid, 60) || null;

    if (!name || !locale || !kind || !text) {
      return NextResponse.json({ ok: false, error: "name, locale, kind, body are required" }, { status: 400 });
    }

    const business_id = await resolveBusinessId(supa, wid, bid);

    if (wid && !(await userCanAccessWidget(user.id, wid))) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    if (business_id && !(await userCanAccessBusiness(user.id, business_id))) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const payload: Record<string, unknown> = { name, locale, kind, body: text };
    if (business_id) payload.business_id = business_id;

    const { data, error } = await supa.from("templates").insert(payload).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, template: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
