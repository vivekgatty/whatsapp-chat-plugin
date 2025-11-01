export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

function readPortalUrl(): string | null {
  const raw = process.env.RAZORPAY_CUSTOMER_PORTAL_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    if (!/^https?:$/i.test(u.protocol)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function GET() {
  const url = readPortalUrl();
  if (!url) {
    return NextResponse.json({ ok:false, error:"portal_url_not_configured" }, { status: 503 });
  }
  // Use a standard HTTP 302 with Location header (works in all runtimes).
  return new Response(null, { status: 302, headers: { Location: url } });
}