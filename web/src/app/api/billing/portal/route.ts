import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const url = process.env.RAZORPAY_CUSTOMER_PORTAL_URL || "";
    if (url) return NextResponse.json({ url });

    return NextResponse.json({
      message:
        "Billing portal will be available once your first subscription is active. Please subscribe first, then manage or download receipts from the portal.",
      code: "PORTAL_UNAVAILABLE",
    });
  } catch (e: any) {
    return NextResponse.json({
      message:
        "We couldn’t open the billing portal right now. Please try again in a minute or contact support.",
      code: "PORTAL_ERROR",
      detail: e?.message ?? "unknown",
    });
  }
}