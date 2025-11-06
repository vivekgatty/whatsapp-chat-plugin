import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Fallback widget id (from your project context)
const FALLBACK_WIDGET_ID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

type UTM = {
  campaign?: string | null;
  source?: string | null;
  medium?: string | null;
  term?: string | null;
  content?: string | null;
};

function parseUTM(sp: URLSearchParams): UTM {
  return {
    campaign: sp.get("utm_campaign"),
    source:   sp.get("utm_source"),
    medium:   sp.get("utm_medium"),
    term:     sp.get("utm_term"),
    content:  sp.get("utm_content"),
  };
}

function sanitizeStr(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

async function insertEvent(payload: {
  widget_id: string;
  page?: string | null;
  meta: Record<string, any>;
}) {
  const supabase = getSupabaseAdmin();
  const { error, data } = await supabase
    .from("analytics")
    .insert({
      widget_id: payload.widget_id,
      event: "trigger_fired",
      page: payload.page ?? null,
      meta: payload.meta,
    })
    .select("id, created_at")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id, created_at: data?.created_at };
}

function ctxFromGET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const wid = sanitizeStr(sp.get("wid")) || FALLBACK_WIDGET_ID;
  const code = sanitizeStr(sp.get("code"));
  const type = sanitizeStr(sp.get("type")); // campaign | intent | context | locale | lifecycle | manual
  const why  = sanitizeStr(sp.get("why"));

  const url      = sanitizeStr(sp.get("url"));
  const pathname = sanitizeStr(sp.get("pathname"));
  const referrer = sanitizeStr(sp.get("referrer")) || req.headers.get("referer");
  const locale   = sanitizeStr(sp.get("locale"));
  const intent   = sanitizeStr(sp.get("intent"));
  const utm      = parseUTM(sp);

  // Preferred page field: explicit pathname, else derived from url
  let page = pathname;
  if (!page && url) {
    try { page = new URL(url).pathname; } catch {}
  }

  return {
    widget_id: wid!,
    page: page || null,
    meta: {
      code, type, why, url, pathname, referrer, locale, intent, utm,
      __source: "trigger-fire:get"
    }
  };
}

function normalizeBody(body: any, req: NextRequest) {
  const sp = new URL(req.url).searchParams; // allow GET params to assist too
  const wid = sanitizeStr(body?.wid) || sanitizeStr(sp.get("wid")) || FALLBACK_WIDGET_ID;

  const code = sanitizeStr(body?.code);
  const type = sanitizeStr(body?.type);
  const why  = sanitizeStr(body?.why);

  const url      = sanitizeStr(body?.url)      ?? sanitizeStr(sp.get("url"));
  const pathname = sanitizeStr(body?.pathname) ?? sanitizeStr(sp.get("pathname"));
  const referrer = sanitizeStr(body?.referrer) ?? req.headers.get("referer");
  const locale   = sanitizeStr(body?.locale)   ?? sanitizeStr(sp.get("locale"));
  const intent   = sanitizeStr(body?.intent)   ?? sanitizeStr(sp.get("intent"));

  const utm: UTM = {
    campaign: sanitizeStr(body?.utm?.campaign) ?? sp.get("utm_campaign"),
    source:   sanitizeStr(body?.utm?.source)   ?? sp.get("utm_source"),
    medium:   sanitizeStr(body?.utm?.medium)   ?? sp.get("utm_medium"),
    term:     sanitizeStr(body?.utm?.term)     ?? sp.get("utm_term"),
    content:  sanitizeStr(body?.utm?.content)  ?? sp.get("utm_content"),
  };

  let page = pathname;
  if (!page && url) {
    try { page = new URL(url).pathname; } catch {}
  }

  return {
    widget_id: wid!,
    page: page || null,
    meta: {
      code, type, why, url, pathname, referrer, locale, intent, utm,
      __source: "trigger-fire:post"
    }
  };
}

export async function GET(req: NextRequest) {
  const payload = ctxFromGET(req);
  if (!payload.meta.code) {
    return NextResponse.json({ ok: false, error: "Missing 'code' in query" }, { status: 400 });
  }
  const res = await insertEvent(payload);
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const payload = normalizeBody(body, req);
  if (!payload.meta.code) {
    return NextResponse.json({ ok: false, error: "Missing 'code' in body" }, { status: 400 });
  }
  const res = await insertEvent(payload);
  return NextResponse.json(res);
}
