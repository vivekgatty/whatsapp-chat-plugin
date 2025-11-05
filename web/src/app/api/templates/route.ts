import { NextResponse } from "next/server";
import * as SA from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

function isClient(x: any) {
  return x && typeof x === "object" && typeof x.from === "function";
}

/** Resolve a Supabase admin client regardless of how the module exports it. */
function getAdmin(): any {
  const m: any = SA as any;

  // 1) Module itself is a client object
  if (isClient(m)) return m;

  // 2) Module itself is a function returning a client
  if (typeof m === "function") {
    const c = m();
    if (isClient(c)) return c;
  }

  // 3) default export (object or factory)
  if (m?.default) {
    if (isClient(m.default)) return m.default;
    if (typeof m.default === "function") {
      const c = m.default();
      if (isClient(c)) return c;
    }
  }

  // 4) named admin (object or factory)
  if (m?.admin) {
    if (isClient(m.admin)) return m.admin;
    if (typeof m.admin === "function") {
      const c = m.admin();
      if (isClient(c)) return c;
    }
  }

  // 5) named factory createAdminClient()
  if (typeof m?.createAdminClient === "function") {
    const c = m.createAdminClient();
    if (isClient(c)) return c;
  }

  throw new Error("supabaseAdmin must export a client (with .from) or a function returning one");
}

// GET /api/templates?business_id=...&locale=...&trigger=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const business_id =
      (searchParams.get("business_id") || "") || (process.env.DEFAULT_BUSINESS_ID || "");
    if (!business_id) {
      return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
    }

    const locale = searchParams.get("locale") || undefined;
    const trig   = searchParams.get("trigger") || undefined;

    const sb = getAdmin();
    let q = sb
      .from("auto_reply_templates")
      .select("*")
      .eq("business_id", business_id)
      .order("created_at", { ascending: false });

    if (locale) q = q.eq("locale", locale);
    if (trig)   q = q.eq("trigger", trig);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to list templates" },
      { status: 500 }
    );
  }
}

// POST body: { business_id?, name, locale, trigger, message, active }
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const business_id = (body?.business_id || "") || (process.env.DEFAULT_BUSINESS_ID || "");
    if (!business_id) {
      return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
    }

    const row = {
      business_id,
      name: String(body?.name || "New Template"),
      locale: String(body?.locale || "en"),
      trigger: String(body?.trigger || "default"),
      message: String(body?.message || ""),
      active: Boolean(body?.active ?? true),
    };

    const sb = getAdmin();
    const { data, error } = await sb
      .from("auto_reply_templates")
      .insert(row)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create template" },
      { status: 500 }
    );
  }
}