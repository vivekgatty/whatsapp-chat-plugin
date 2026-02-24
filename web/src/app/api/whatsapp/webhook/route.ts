import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/utils/webhookSignature";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "";
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const verifyToken = req.nextUrl.searchParams.get("hub.verify_token");

  if (!token) {
    return NextResponse.json({ ok: false, error: "WHATSAPP_WEBHOOK_VERIFY_TOKEN missing" }, { status: 500 });
  }

  if (mode === "subscribe" && verifyToken === token && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false, error: "verification_failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET || "";
  if (!appSecret) {
    return NextResponse.json({ ok: false, error: "META_APP_SECRET missing" }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";
  if (!verifyWebhookSignature(payload, signature, appSecret)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  const internalSecret = process.env.INTERNAL_WEBHOOK_QUEUE_SECRET || "";
  const processUrl = new URL("/api/webhooks/meta/process", req.url).toString();
  fetch(processUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: payload,
  }).catch(() => {});

  return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
}
