import { NextResponse } from "next/server";
import * as SA from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

/** Resolve an admin Supabase client regardless of how the module exports it. */
function getAdmin(): any {
  const m: any = SA as any;
  if (typeof m === "function") return m();
  if (m.default && typeof m.default === "function") return m.default();
  if (m.admin && typeof m.admin === "function") return m.admin();
  if (m.createAdminClient && typeof m.createAdminClient === "function") return m.createAdminClient();
  if (m.getAdminClient && typeof m.getAdminClient === "function") return m.getAdminClient();
  if (m.supabaseAdmin && typeof m.supabaseAdmin === "function") return m.supabaseAdmin();
  throw new Error("supabaseAdmin must export a function that returns a Supabase client");
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const id = context?.params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    const allow = ["name","locale","trigger","message","active"];
    for (const k of allow) {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        patch[k] = k === "active" ? Boolean(body[k]) : body[k];
      }
    }
    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const sb = getAdmin();
    const { data, error } = await sb
      .from("auto_reply_templates")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: { params: { id: string } }) {
  try {
    const id = context?.params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const sb = getAdmin();
    const { error } = await sb
      .from("auto_reply_templates")
      .delete()
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}