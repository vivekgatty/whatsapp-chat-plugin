import { NextResponse } from "next/server";
export const runtime = "nodejs";
/** stamp: 2025-11-01_07-37-21 */

// TODO: Replace stub with real Supabase query once your v_business_plan view is ready.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const business_id = searchParams.get("business_id") ?? process.env.DEFAULT_BUSINESS_ID ?? "stub-business";
    const payload = {
      ok: true,
      business: { id: business_id, name: "Your Business", website: "https://chatmadi.com", email: "admin@chatmadi.com", phone: "9591428002" },
      plan: "free",
      used: 0,
      quota: 100,
    };
    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "overview_failed", detail: String(e?.message ?? e) }, { status: 200 });
  }
}