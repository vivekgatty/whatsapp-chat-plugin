// /api/log — tolerant logger; never throws to the browser
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({} as any));
    const event = (payload && payload.event) || null;
    const business_id = (payload && payload.business_id) || null;
    const widget_id = (payload && payload.widget_id) || null;
    const page_url = (payload && payload.page_url) || null;
    const meta = (payload && payload.meta) || {};

    // Basic validation
    if (!event) {
      return Response.json({ ok: false, error: "missing_event" }, { status: 400 });
    }

    // Optional DB write (only if ids are present and env is configured)
    if (business_id && widget_id) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const key =
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          "";
        if (url && key) {
          const supabase = createClient(url, key, { auth: { persistSession: false } });
          await supabase.from("analytics").insert({
            business_id,
            widget_id,
            event,
            page_url,
            meta,
          });
        }
      } catch {
        // ignore DB errors; do not break the widget
      }
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "unexpected" }, { status: 500 });
  }
}
