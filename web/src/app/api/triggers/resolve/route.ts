import { NextRequest, NextResponse } from "next/server";
import { resolveSystemTrigger } from "@/lib/triggerResolver";

type U = Record<string, string | null>;

function booly(v: string | null): boolean | null {
  if (v == null) return null;
  const s = v.toLowerCase();
  return ["1","true","yes","y"].includes(s) ? true
       : ["0","false","no","n"].includes(s) ? false
       : null;
}

function ctxFromParams(sp: URLSearchParams) {
  const utm = {
    campaign: sp.get("utm_campaign"),
    source:   sp.get("utm_source"),
    medium:   sp.get("utm_medium"),
    term:     sp.get("utm_term"),
    content:  sp.get("utm_content"),
  } as U;

  const seen = booly(sp.get("seen"));

  return {
    url:            sp.get("url"),
    pathname:       sp.get("pathname"),
    referrer:       sp.get("referrer"), // optional explicit override
    locale:         sp.get("locale"),
    seenFlag:       seen,
    manualOverride: sp.get("trigger"),
    intent:         sp.get("intent"),
    utm,
  };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ctx = ctxFromParams(sp);

  // If referrer not explicitly set, fall back to header
  const headerRef = req.headers.get("referer");
  if (!ctx.referrer && headerRef) (ctx as any).referrer = headerRef;

  const resolution = resolveSystemTrigger(ctx as any);
  return NextResponse.json({ ok: true, ctx, resolution });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = new URL(req.url);
  const sp = url.searchParams;

  // Build from query first, then let JSON body override
  const baseCtx = ctxFromParams(sp);
  const merged = {
    ...baseCtx,
    ...body,
    utm: { ...(baseCtx.utm || {}), ...((body?.utm) || {}) },
  };

  const headerRef = req.headers.get("referer");
  if (!merged.referrer && headerRef) (merged as any).referrer = headerRef;

  const resolution = resolveSystemTrigger(merged as any);
  return NextResponse.json({ ok: true, ctx: merged, resolution });
}
