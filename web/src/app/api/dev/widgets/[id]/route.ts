// src/app/api/dev/widgets/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// IMPORTANT: This is a dev-only endpoint that uses the SERVICE ROLE key.
// Never expose this in client code or ship it to prod without auth.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type Body = Partial<{
  theme_color: string;
  icon: "whatsapp" | "message";
  cta_text: string;
  position: "left" | "right";
  prefill_message: string;
}>;

// ✅ Only the function signature is changed:
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing widget id in path" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as Body;

    // Very light validation
    const updates: Body = {};
    if (typeof body.theme_color === "string") updates.theme_color = body.theme_color;
    if (body.icon === "whatsapp" || body.icon === "message") updates.icon = body.icon;
    if (typeof body.cta_text === "string") updates.cta_text = body.cta_text;
    if (body.position === "left" || body.position === "right") updates.position = body.position;
    if (typeof body.prefill_message === "string") updates.prefill_message = body.prefill_message;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No allowed fields provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("widgets")
      .update(updates)
      .eq("id", id)
      .select("id,business_id,theme_color,icon,cta_text,position,prefill_message,created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, widget: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
