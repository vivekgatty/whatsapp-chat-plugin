// /api/track-lead
import { NextResponse } from "next/server";
// Use a RELATIVE import to avoid alias issues
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const u = new URL(req.url);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const wid =
      body.wid ||
      body.widget_id ||
      u.searchParams.get("wid") ||
      body.id ||
      u.searchParams.get("id");

    const name = String(body.name ?? body.wcp_name ?? "").slice(0, 100);
    const message = String(body.message ?? body.wcp_message ?? "").slice(0, 1000);
    const phone = String(body.phone ?? body.wcp_phone ?? "").slice(0, 30);
    const source = String(body.source ?? "widget");
    const opt_in_source = String(body.opt_in_source ?? "website_widget");
    const conversation_started = Boolean(body.conversation_started ?? false);

    if (!wid) {
      return NextResponse.json({ ok: false, warn: "missing wid" }, { status: 200 });
    }

    // Widget -> business (graceful: allow 0 rows and use DEFAULT_BUSINESS_ID)
    const { data: widget } = await getSupabaseAdmin()
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
    const { error: lerr } = await getSupabaseAdmin().from("leads").insert({
      business_id,
      widget_id: wid,
      name,
      message,
      source,
      phone: phone || null,
    });
    if (lerr) {
      return NextResponse.json({ ok: false, warn: lerr.message }, { status: 200 });
    }



    // Best-effort CRM contact creation on first conversation start from widget
    if (conversation_started) {
      const admin = getSupabaseAdmin();
      const baseContact = {
        business_id,
        widget_id: wid,
        name: name || null,
        phone: phone || null,
      };

      // Attempt with explicit opt-in/source fields first
      const { error: c1 } = await admin.from("contacts").insert({
        ...baseContact,
        opt_in_source,
        source,
      });

      // Fallback for narrower schemas
      if (c1) {
        await admin.from("contacts").insert(baseContact);
      }
    }

    // Record 'lead' analytics (best-effort)
    await getSupabaseAdmin().from("analytics").insert({
      business_id,
      widget_id: wid,
      event_type: "lead",
      meta: { source, conversation_started, opt_in_source },
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
          phone,
          opt_in_source,
          conversation_started,
          created_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
