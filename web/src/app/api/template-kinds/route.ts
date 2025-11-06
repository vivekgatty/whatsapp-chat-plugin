export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";

type KindRow = {
  id: string;
  widget_id: string | null;
  key: string;
  label: string;
  created_at: string;
};

// GET /api/template-kinds?wid=<uuid>
export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const wid = u.searchParams.get("wid");
    const supa = getSupabaseAdmin();

    let q = supa.from("template_kinds").select("*").order("label", { ascending: true }) as any;
    if (wid) q = q.eq("widget_id", wid);

    const { data, error } = await q;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, kinds: (data as KindRow[]) ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}

// POST /api/template-kinds  body: { wid?: string, key: string, label: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key  = (body?.key || "").trim();
    const label = (body?.label || "").trim();
    const wid: string | null = (body?.wid || "").trim() || null;

    if (!key || !label) {
      return NextResponse.json({ ok: false, error: "key and label are required" }, { status: 400 });
    }

    const supa = getSupabaseAdmin();
    const { data, error } = await supa
      .from("template_kinds")
      .insert({ key, label, widget_id: wid })
      .select("*")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, kind: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
