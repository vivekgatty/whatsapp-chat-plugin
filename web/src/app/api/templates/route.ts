import { NextResponse } from "next/server";
import * as SA from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

/** Resolve a Supabase admin client regardless of how the module exports it. */
function getAdmin(): any {
  const m: any = SA as any;
  if (typeof m === "function") return m();                             // default export is a function
  if (m.default && typeof m.default === "function") return m.default(); // default export fn
  if (m.admin && typeof m.admin === "function") return m.admin();       // named admin()
  if (m.createAdminClient && typeof m.createAdminClient === "function") return m.createAdminClient(); // named creator
  throw new Error("supabaseAdmin must export a function that returns a Supabase client");
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
    let q = sb.from("auto_reply_templates")
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