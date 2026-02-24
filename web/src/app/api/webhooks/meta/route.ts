import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/utils/webhookSignature";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const appSecret = process.env.META_APP_SECRET || "";
  if (!appSecret) {
    return NextResponse.json({ ok: false, error: "META_APP_SECRET missing" }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";

  if (!verifyWebhookSignature(payload, signature, appSecret)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  // Process events here (intentionally not logging payload to avoid sensitive data leakage)
  return NextResponse.json({ ok: true });
}
