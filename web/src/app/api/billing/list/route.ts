import { NextResponse } from "next/server";
export const runtime = "nodejs";
/** safe billing list — stamp: 2025-11-01_09-17-27 */
export async function GET() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    // No keys yet -> don't crash Billing page
    return NextResponse.json({ ok: true, items: [] });
  }
  try {
    // Replace with real Razorpay fetch later
    return NextResponse.json({ ok: true, items: [] });
  } catch (e) {
    return NextResponse.json({ ok: false, items: [], error: "billing_unavailable" });
  }
}