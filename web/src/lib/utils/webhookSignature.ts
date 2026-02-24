import crypto from "crypto";

export function verifyWebhookSignature(payload: string, signature: string, appSecret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("hex");

  const expected = `sha256=${expectedSignature}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  if (a.length != b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
