export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json().catch(() => ({}));
    const patch: any = {};
    if (typeof body?.name === "string") patch.name = body.name.trim();
    if (typeof body?.locale === "string") patch.locale = body.locale.trim();
    if (typeof body?.kind === "string") patch.kind = body.kind.trim();
    if (typeof body?.body === "string") patch.body = body.body.trim();
    if (!Object.keys(patch).length)
      return NextResponse.json({ ok: false, error: "nothing to update" }, { status: 400 });

    const supa = getSupabaseAdmin();
    const { data, error } = await supa.from("templates").update(patch).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, template: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const supa = getSupabaseAdmin();
    const { error } = await supa.from("templates").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
