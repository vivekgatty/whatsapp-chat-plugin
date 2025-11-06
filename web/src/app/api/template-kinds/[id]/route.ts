export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";

// PATCH body: { key?, label? }
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => ({}));
    const patch: any = {};
    if (typeof body?.key === "string") patch.key = body.key.trim();
    if (typeof body?.label === "string") patch.label = body.label.trim();
    if (!Object.keys(patch).length) {
      return NextResponse.json({ ok: false, error: "nothing to update" }, { status: 400 });
    }
    const supa = getSupabaseAdmin();
    const { data, error } = await supa.from("template_kinds").update(patch).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, kind: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const supa = getSupabaseAdmin();
    const { error } = await supa.from("template_kinds").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
