// src/app/api/dev/widgets/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client (SERVICE ROLE bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: list latest widgets (dev utility)
export async function GET() {
  const { data, error } = await supabase
    .from("widgets")
    .select("id,business_id,cta_text,position,created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, widgets: data ?? [] });
}

type CreateWidgetBody = {
  business_id: string;
  theme_color?: string;
  icon?: string;
  cta_text?: string;
  position?: "left" | "right";
  prefill_message?: string;
  prechat_enabled?: boolean;
};

// POST: create a widget (dev utility)
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateWidgetBody;

    if (!body?.business_id) {
      return NextResponse.json({ ok: false, error: "business_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("widgets")
      .insert({
        business_id: body.business_id,
        theme_color: body.theme_color ?? "#22c55e",
        icon: body.icon ?? "whatsapp",
        cta_text: body.cta_text ?? "Chat on WhatsApp",
        position: body.position ?? "right",
        prefill_message: body.prefill_message ?? "Hi! I have a quick question.",
        prechat_enabled: body.prechat_enabled ?? false,
      })
      .select("id,business_id,cta_text,position,created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, widget: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// DELETE: remove a widget by id (dev utility)
// Usage: DELETE /api/dev/widgets?id=<widget_id>
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("widgets").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}
