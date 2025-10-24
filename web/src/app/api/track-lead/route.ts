// /api/track-lead
import { NextResponse } from "next/server";
// Use a RELATIVE import to avoid alias issues
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const u = new URL(req.url);
    const body = await req.json().catch(() => ({} as any));

    const wid =
      body.wid || body.widget_id || u.searchParams.get("wid") ||
      body.id  || u.searchParams.get("id");

    const name    = String(body.name    ?? body.wcp_name    ?? "").slice(0, 100);
    const message = String(body.message ?? body.wcp_message ?? "").slice(0, 1000);
    const source  = String(body.source  ?? "widget");

    if (!wid) {
      return NextResponse.json({ ok: false, warn: "missing wid" }, { status: 200 });
    }

    // Widget -> business (graceful: allow 0 rows and use DEFAULT_BUSINESS_ID)
    const { data: widget, error: werr } = await supabaseAdmin
      .from("widgets")
      .select("id,business_id")
      .eq("id", wid)
      .maybeSingle(); // <= tolerate 0 rows

    // Prefer DB link; otherwise use fallback
    const business_id = widget?.business_id || process.env.DEFAULT_BUSINESS_ID || null;

    if (!business_id) {
      // Only hard-stop if there's truly no business id available
      return NextResponse.json(
        { ok: false, warn: "Missing business_id after widget lookup" },
        { status: 200 }
      );
    }

    // Insert lead
    const { error: lerr } = await supabaseAdmin.from("leads").insert({
      business_id,
      widget_id: wid,
      name,
      message,
      source,
    });
    if (lerr) {
      return NextResponse.json({ ok: false, warn: lerr.message }, { status: 200 });
    }

    // Record 'lead' analytics (best-effort)
    await supabaseAdmin.from("analytics").insert({
      business_id,
      widget_id: wid,
      event_type: "lead",
      meta: { source },
    });

    // Optional webhook (accept legacy env name too)
    const webhook = process.env.GSHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_id,
          widget_id: wid,
          name,
          message,
          source,
          created_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
  }
}
