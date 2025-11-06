import { NextRequest, NextResponse } from "next/server";
import { recordTriggerFire } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}));
    const {
      widget_id = null,
      code,
      type,
      why,
      page = null,
      locale = null,
    } = data || {};

    if (!code || !type || !why) {
      return NextResponse.json({ ok: false, error: "Missing code/type/why" }, { status: 400 });
    }

    await recordTriggerFire({ widget_id, code, type, why, page, locale });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "insert_failed" }, { status: 500 });
  }
}
