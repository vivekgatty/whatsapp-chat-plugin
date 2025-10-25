// src/app/api/dev/leads/route.ts
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server-only: create the admin client at request-time (avoids build-time env crashes)
function getAdminSupabase(): SupabaseClient {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY; // fallback if old name exists
  if (!url) throw new Error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE is missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

type Body = {
  business_id: string; // required
  name?: string;
  message?: string;
  utm_source?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.business_id) {
      return NextResponse.json(
        { ok: false, error: "business_id is required" },
        { status: 400 }
      );
    }

    const referrer = req.headers.get("referer") ?? null;
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        business_id: body.business_id,
        name: body.name ?? null,
        message: body.message ?? null,
        utm_source: body.utm_source ?? null,
        referrer,
      })
      .select("id, business_id, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
