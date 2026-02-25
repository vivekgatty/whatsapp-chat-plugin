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

function processWebhookAsync(input: {
  body: Record<string, unknown>;
  signature: string;
  requestUrl: string;
}) {
  const appSecret = process.env.META_APP_SECRET || "";
  const internalSecret = process.env.INTERNAL_WEBHOOK_QUEUE_SECRET || "";

  if (!appSecret || !internalSecret) return Promise.resolve();

  const payload = JSON.stringify(input.body || {});
  if (!verifyWebhookSignature(payload, input.signature, appSecret)) {
    return Promise.resolve();
  }

  const processUrl = new URL("/api/webhooks/meta/process", input.requestUrl).toString();
  return fetch(processUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: payload,
  }).then(() => undefined);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const signature = req.headers.get("x-hub-signature-256") || "";

  // Return 200 FIRST, then process async
  const response = NextResponse.json({ status: "ok" }, { status: 200 });

  // Non-blocking background processing
  processWebhookAsync({ body, signature, requestUrl: req.url }).catch((err: unknown) =>
    console.error("Webhook error:", err),
  );

  return response;
}
