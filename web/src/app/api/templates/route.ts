import { NextResponse } from "next/server";
import supabaseAdmin from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

async function resolveBusinessId(search: URLSearchParams) {
  const sb = supabaseAdmin();
  const direct = search.get("business_id");
  if (direct) return direct;

  const wid = search.get("wid");
  if (wid) {
    const { data, error } = await sb.from("widgets").select("business_id").eq("id", wid).maybeSingle();
    if (!error && data && data.business_id) return data.business_id as string;
  }
  const fallback = process.env.DEFAULT_BUSINESS_ID || "";
  if (!fallback) throw new Error("No business_id. Provide ?wid= or ?business_id= or set DEFAULT_BUSINESS_ID.");
  return fallback;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sb = supabaseAdmin();
    const business_id = await resolveBusinessId(url.searchParams);
    const locale = url.searchParams.get("locale") || undefined;
    const kind = url.searchParams.get("kind") || undefined;

    let q = sb.from("templates").select("*").eq("business_id", business_id).order("updated_at", { ascending: false });
    if (locale) q = q.eq("locale", locale);
    if (kind) q = q.eq("kind", kind);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ ok: true, templates: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const sb = supabaseAdmin();
    const business_id = await resolveBusinessId(url.searchParams);
    const body = await req.json();

    const payload = {
      business_id,
      locale: String(body.locale || "en"),
      kind: String(body.kind || "greeting"),
      name: String(body.name || ""),
      body: String(body.body || ""),
    };

    const { data, error } = await sb.from("templates").insert(payload).select("*").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, template: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}
