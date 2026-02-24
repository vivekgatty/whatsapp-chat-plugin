import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.INTERNAL_WEBHOOK_QUEUE_SECRET || "";
  const given = req.headers.get("x-internal-secret") || "";
  if (!secret || given !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  // async processor storage (for workers to consume)
  await getSupabaseAdmin().from("webhook_events").insert({
    provider: "meta",
    payload: body,
    status: "queued",
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, queued: true });
}
