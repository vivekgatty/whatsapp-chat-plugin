import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Create a lead
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").insert({
      name: body.name ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      message: body.message ?? null,
      widget_id: body.widget_id ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

// (Optional) List recent leads for quick sanity checks
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, leads: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
