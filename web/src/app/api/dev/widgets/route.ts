// src/app/api/dev/widgets/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// IMPORTANT: This file runs on the server only.
// It uses the SERVICE ROLE key, which bypasses RLS.
// Never expose this key to the browser.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("widgets")
    .select("id,business_id,cta_text,position,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, widgets: data ?? [] });
}
