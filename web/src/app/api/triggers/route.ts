import { NextResponse } from "next/server";
import * as SA from "../../../lib/supabaseAdmin";
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

function okType(t: any): t is AllowedType {
  return typeof t === "string" && (ALLOWED_TYPES as readonly string[]).includes(t);
}

// GET /api/triggers?business_id=...&active=1
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const business_id = (searchParams.get("business_id") || "") || (process.env.DEFAULT_BUSINESS_ID || "");
    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    const onlyActive = searchParams.get("active");
    const sb = admin();

    let q = sb.from("business_triggers")
      .select("*")
      .eq("business_id", business_id)
      .order("created_at", { ascending: false });

    if (onlyActive === "1" || onlyActive === "true") q = q.eq("active", true);

    const { data, error } = await q;
    if (error) throw error;

    const can_write = await isPaid(sb, business_id);
    return NextResponse.json({ items: data ?? [], can_write, allowed_types: ALLOWED_TYPES });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to list triggers" }, { status: 500 });
  }
}

// POST body: { business_id?, code, label, type, matchers?, active? }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const business_id = (body?.business_id || "") || (process.env.DEFAULT_BUSINESS_ID || "");
    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    const sb = admin();
    const paid = await isPaid(sb, business_id);
    if (!paid) {
      return NextResponse.json(
        { error: "Custom triggers require the Pro plan (₹199/month).", requires_upgrade: true },
        { status: 402 }
      );
    }

    const code = String(body?.code || "").trim();
    const label = String(body?.label || "").trim();
    const type = String(body?.type || "").trim();
    const matchers = (body?.matchers ?? {});
    const active = Boolean(body?.active ?? true);

    if (!/^[a-z0-9_]{3,30}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code. Use 3–30 chars: a-z, 0-9, underscore." }, { status: 400 });
    }
    if (!label) return NextResponse.json({ error: "Label is required." }, { status: 400 });
    if (!okType(type)) return NextResponse.json({ error: "Invalid type." }, { status: 400 });

    const row = { business_id, code, label, type, matchers, active };
    const { data, error } = await sb.from("business_triggers").insert(row).select("*").single();
    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create trigger" }, { status: 500 });
  }
}