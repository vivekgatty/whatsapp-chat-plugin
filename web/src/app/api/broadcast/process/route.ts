import { NextRequest, NextResponse } from "next/server";
import { requireFeatureAccess } from "@/lib/feature-access";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BATCH_SIZE = 30;
const BATCH_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const access = await requireFeatureAccess(req, "BROADCASTS");
  if (!access.ok) return NextResponse.json({ ok: false, error: access.error }, { status: access.status });

  const db = getSupabaseAdmin();
  let sent = 0;

  for (;;) {
    const { data: pending, error } = await db
      .from("broadcast_queue")
      .select("id,workspace_id,business_id,to_number,payload")
      .eq("workspace_id", access.workspaceId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    if (!pending || pending.length === 0) break;

    for (const job of pending) {
      await db
        .from("broadcast_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", job.id);
      sent += 1;
    }

    if (pending.length < BATCH_SIZE) break;
    await sleep(BATCH_DELAY_MS);
  }

  return NextResponse.json({ ok: true, sent, rate_limit: `${BATCH_SIZE}/sec` });
}
