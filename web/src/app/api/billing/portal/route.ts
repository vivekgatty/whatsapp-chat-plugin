export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";

function redirectOrExplain() {
  const url = process.env.RAZORPAY_CUSTOMER_PORTAL_URL;
  if (!url) {
    return NextResponse.json({ ok: false, error: "portal_url_not_configured" });
  }
  return NextResponse.redirect(url, { status: 302 });
}

export function GET(_req: NextRequest) { return redirectOrExplain(); }
export function POST(_req: NextRequest) { return redirectOrExplain(); }