export const runtime = "nodejs";

import { NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";
import { requireApiSession, userCanAccessBusiness } from "@/lib/apiAuth";
import { sanitizeText } from "@/lib/utils/sanitize";

// PATCH /api/templates/[id]  body: { name?, locale?, kind?, body? }
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params?.id as string;
    if (!id) return NextResponse.json({ ok:false, error:"missing id" }, { status:400 });

    const user = await requireApiSession();
    if (!user) return NextResponse.json({ ok:false, error:"unauthorized" }, { status:401 });

    const supa = getSupabaseAdmin();
    const { data: existing } = await supa.from("templates").select("id,business_id").eq("id", id).maybeSingle();
    if (!existing) return NextResponse.json({ ok:false, error:"not found" }, { status:404 });
    if (existing.business_id && !(await userCanAccessBusiness(user.id, existing.business_id))) {
      return NextResponse.json({ ok:false, error:"forbidden" }, { status:403 });
    }

    const body = await request.json().catch(() => ({}));
    const patch: Record<string, string> = {};
    if (typeof body?.name === "string")   patch.name   = sanitizeText(body.name, 120);
    if (typeof body?.locale === "string") patch.locale = sanitizeText(body.locale, 16);
    if (typeof body?.kind === "string")   patch.kind   = sanitizeText(body.kind, 40);
    if (typeof body?.body === "string")   patch.body   = sanitizeText(body.body, 2000);
    if (!Object.keys(patch).length) {
      return NextResponse.json({ ok: false, error: "nothing to update" }, { status: 400 });
    }

    const { data, error } = await supa.from("templates").update(patch).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 });
    return NextResponse.json({ ok:true, template:data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok:false, error:message }, { status:500 });
  }
}

// DELETE /api/templates/[id]
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params?.id as string;
    if (!id) return NextResponse.json({ ok:false, error:"missing id" }, { status:400 });

    const user = await requireApiSession();
    if (!user) return NextResponse.json({ ok:false, error:"unauthorized" }, { status:401 });

    const supa = getSupabaseAdmin();
    const { data: existing } = await supa.from("templates").select("id,business_id").eq("id", id).maybeSingle();
    if (!existing) return NextResponse.json({ ok:false, error:"not found" }, { status:404 });
    if (existing.business_id && !(await userCanAccessBusiness(user.id, existing.business_id))) {
      return NextResponse.json({ ok:false, error:"forbidden" }, { status:403 });
    }

    const { error } = await supa.from("templates").delete().eq("id", id);
    if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 });
    return NextResponse.json({ ok:true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok:false, error:message }, { status:500 });
  }
}
