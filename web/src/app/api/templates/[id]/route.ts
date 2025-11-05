import { NextResponse } from "next/server";
import * as SA from "../../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function isClient(x: any) { return x && typeof x === "object" && typeof x.from === "function"; }
function buildFallback() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
  if (!key) throw new Error("Missing env SUPABASE_SERVICE_ROLE");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
function getAdmin(): any {
  const m: any = SA as any;
  if (isClient(m)) return m;
  if (typeof m === "function") { const c = m(); if (isClient(c)) return c; }
  if (m?.default) {
    if (isClient(m.default)) return m.default;
    if (typeof m.default === "function") { const c = m.default(); if (isClient(c)) return c; }
  }
  if (m?.admin) {
    if (isClient(m.admin)) return m.admin;
    if (typeof m.admin === "function") { const c = m.admin(); if (isClient(c)) return c; }
  }
  if (typeof m?.createAdminClient === "function") {
    const c = m.createAdminClient(); if (isClient(c)) return c;
  }
  return buildFallback();
}

// PUT /api/templates/[id]
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();
    const patch: Record<string, unknown> = {};
    for (const k of ["name", "locale", "trigger", "message", "active"]) {
      if (body?.[k] !== undefined) patch[k] = body[k];
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

// DELETE /api/templates/[id]
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const sb = getAdmin();
    const { error } = await sb.from("auto_reply_templates").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}