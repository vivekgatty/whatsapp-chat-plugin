// /api/analytics
import { NextResponse } from "next/server";
// Use a RELATIVE import to avoid alias issues
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Accept wid from JSON body or query string
    const u = new URL(req.url);
    const body = await req.json().catch(() => ({} as any));
    const wid =
      body.wid || body.widget_id || u.searchParams.get("wid") ||
      body.id  || u.searchParams.get("id");

    const event_type = String(body.event_type || body.event || "impression");
    const meta = body.meta ?? {};

    if (!wid) {
      return NextResponse.json({ ok: false, warn: "missing wid" }, { status: 200 });
    }

    // Look up widget → business
    const { data: widget, error: werr } = await supabaseAdmin
      .from("widgets")
      .select("id,business_id")
      .eq("id", wid)
      .single();

    if (werr) {
      return NextResponse.json(
        { ok: false, warn: "widget lookup failed", detail: werr.message },
        { status: 200 }
      );
    }

    const business_id = widget?.business_id || process.env.DEFAULT_BUSINESS_ID || null;
    if (!business_id) {
      // Still no business id → we refuse to insert (keeps data isolated)
      return NextResponse.json(
        { ok: false, warn: "Missing business_id after widget lookup" },
        { status: 200 }
      );
    }

    // Insert analytics row
    const { error: ierr } = await supabaseAdmin.from("analytics").insert({
      business_id,
      widget_id: wid,
      event_type,
      meta,
    });

    if (ierr) {
      return NextResponse.json({ ok: false, warn: ierr.message }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
  }
}
