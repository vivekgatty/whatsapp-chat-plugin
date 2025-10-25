// src/app/api/dev/widgets/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Ensure Node runtime & dynamic eval (prevents build-time env reads)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// DEV-ONLY: service role client (never expose to browser)
function getAdminSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE is missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

type Body = Partial<{
  theme_color: string;
  icon: "whatsapp" | "message";
  cta_text: string;
  position: "left" | "right";
  prefill_message: string;
}>;

export async function PATCH(req: Request, context: any) {
  try {
    const id = context?.params?.id as string | undefined;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing widget id in path" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as Body;

    // allow only whitelisted fields
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

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("widgets")
      .update(updates)
      .eq("id", id)
      .select(
        "id,business_id,theme_color,icon,cta_text,position,prefill_message,created_at"
      )
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
