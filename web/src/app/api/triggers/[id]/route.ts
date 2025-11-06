import { NextResponse } from "next/server";
import * as SA from "../../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["manual","url_param","utm","path_match"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function isClient(x: any) { return x && typeof x === "object" && typeof x.from === "function"; }

function buildFallback() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
  if (!key) throw new Error("Missing env SUPABASE_SERVICE_ROLE");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Resolve a Supabase admin client regardless of how the module exports it. */
function admin(): any {
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

/** Soft-gate: Pro plan (₹199) required for write operations */
async function isPaid(sb: any, business_id: string): Promise<boolean> {
  try {
    const { data, error } = await sb
      .from("businesses")
      .select("plan, subscription_status")
      .eq("id", business_id)
      .single();
    if (error || !data) return false;
    const plan = String(data.plan || "").toLowerCase();
    const status = String(data.subscription_status || "").toLowerCase();
    if (status === "active") return true;
    return ["pro","business","paid"].includes(plan);
  } catch { return false; }
}

function isAllowedType(t: any): t is AllowedType {
  return typeof t === "string" && (ALLOWED_TYPES as readonly string[]).includes(t);
}

// PUT /api/triggers/[id]
export async function PUT(req: Request, ctx: any) {
  try {
    const id = ctx?.params?.id as string | undefined;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    if ("code" in body) {
      return NextResponse.json({ error: "Code is immutable." }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    for (const k of ["label","type","matchers","active"]) {
      if (k in body) patch[k] = body[k];
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }
    if ("type" in patch && !isAllowedType(patch["type"])) {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }

    const sb = admin();

    // Find business_id for gating
    const { data: found, error: findErr } = await sb
      .from("business_triggers")
      .select("business_id")
      .eq("id", id)
      .single();
    if (findErr || !found) {
      return NextResponse.json({ error: "Trigger not found." }, { status: 404 });
    }

    const paid = await isPaid(sb, found.business_id);
    if (!paid) {
      return NextResponse.json(
        { error: "Custom triggers require the Pro plan (₹199/month).", requires_upgrade: true },
        { status: 402 }
      );
    }

    const { data, error } = await sb
      .from("business_triggers")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update trigger" }, { status: 500 });
  }
}

// DELETE /api/triggers/[id]
export async function DELETE(_req: Request, ctx: any) {
  try {
    const id = ctx?.params?.id as string | undefined;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const sb = admin();

    // Find business_id for gating
    const { data: found, error: findErr } = await sb
      .from("business_triggers")
      .select("business_id")
      .eq("id", id)
      .single();
    if (findErr || !found) {
      return NextResponse.json({ error: "Trigger not found." }, { status: 404 });
    }

    const paid = await isPaid(sb, found.business_id);
    if (!paid) {
      return NextResponse.json(
        { error: "Custom triggers require the Pro plan (₹199/month).", requires_upgrade: true },
        { status: 402 }
      );
    }

    const { error } = await sb.from("business_triggers").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete trigger" }, { status: 500 });
  }
}