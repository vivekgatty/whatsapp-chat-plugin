import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireFeatureAccess } from "@/lib/feature-access";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const access = await requireFeatureAccess(req, "AUTOMATIONS");
  if (!access.ok) return NextResponse.json({ ok: false, error: access.error }, { status: access.status });

  const db = getSupabaseAdmin();

  // Pull local active template identifiers and mark sync checkpoint.
  const { data: rows } = await db
     .from("templates")
    .select("id,workspace_id,business_id,external_template_id,status")
    .eq("workspace_id", access.workspaceId)
    .not("external_template_id", "is", null)
    .limit(1000);

  // Placeholder: integrate Meta Graph template status API here.
  // For now we stamp sync time to avoid per-page load sync.
  const now = new Date().toISOString();
  for (const r of rows || []) {
    await db.from("templates").update({ last_synced_at: now }).eq("id", r.id).eq("workspace_id", access.workspaceId);
  }

  return NextResponse.json({ ok: true, synced: (rows || []).length, synced_at: now });
}
