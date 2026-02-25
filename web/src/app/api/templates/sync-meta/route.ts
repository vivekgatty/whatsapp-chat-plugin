import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET || "";
  const provided = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret") || "";
  if (cronSecret && provided !== cronSecret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();

  // Pull local active template identifiers and mark sync checkpoint.
  const { data: rows } = await db
    .from("templates")
    .select("id,external_template_id,status")
    .not("external_template_id", "is", null)
    .limit(1000);

  // Placeholder: integrate Meta Graph template status API here.
  // For now we stamp sync time to avoid per-page load sync.
  const now = new Date().toISOString();
  for (const r of rows || []) {
    await db.from("templates").update({ last_synced_at: now }).eq("id", r.id);
  }

  return NextResponse.json({ ok: true, synced: (rows || []).length, synced_at: now });
}
