import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");

  // timing-safe compare
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "RAZORPAY_WEBHOOK_SECRET is missing" }, { status: 500 });
  }

  const signature = req.headers.get("x-razorpay-signature") || "";
  const rawBody = await req.text();

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Minimal example: store webhook (if you have a table to audit events)
  try {
    const supabase = getSupabaseAdmin();
    // Safe to no-op if the table doesn't exist; errors are caught.
    await supabase.from("payments_webhooks").insert({
      event: payload?.event ?? null,
      payload, // requires JSONB column
    } as any);
  } catch {
    // swallow insert errors to not break webhook handling
  }

  return NextResponse.json({ ok: true });
}
