// src/app/api/dev/widgets/route.ts
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Ensure this API runs at runtime (not statically analyzed at build)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// DEV-ONLY: build the admin client at request time so env isn't read at build
function getAdminSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE is missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("widgets")
      .select(
        "id,business_id,theme_color,icon,cta_text,position,prefill_message,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, widgets: data ?? [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
