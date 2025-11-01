export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

export async function GET() {
  const raw = (process.env.RAZORPAY_CUSTOMER_PORTAL_URL ?? "").trim();
  const ok  = /^https?:\/\//i.test(raw);
  if (!ok) {
    return new NextResponse("Billing portal URL not configured", { status: 503 });
  }
  return NextResponse.redirect(raw, 302);
}