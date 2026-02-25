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

  const internalSecret = process.env.INTERNAL_WEBHOOK_QUEUE_SECRET || "";
  const queueUrl = new URL("/api/webhooks/meta/process", req.url).toString();
  fetch(queueUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: payload,
  }).catch(() => {});

  // Immediate ACK for webhook provider; heavy processing is asynchronous
  return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
}
