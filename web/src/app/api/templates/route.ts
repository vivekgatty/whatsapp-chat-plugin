import { NextResponse } from "next/server";
import admin from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

// GET /api/templates?business_id=...&locale=...&trigger=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Fallback to DEFAULT_BUSINESS_ID if not provided
    const business_id =
      (searchParams.get("business_id") || "") || (process.env.DEFAULT_BUSINESS_ID || "");

    if (!business_id) {
      return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
    }

    const locale = searchParams.get("locale") || undefined;
    const trig   = searchParams.get("trigger") || undefined;

    const sb = admin();
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

    // Allow client to omit business_id and fall back on server env
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

    const sb = admin();
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