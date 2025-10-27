import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split("/").filter(Boolean);
    const id = decodeURIComponent(parts[parts.length - 1] || "");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("widgets")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("widget-config error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, widget: data });
  } catch (e: any) {
    console.error("widget-config exception:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}
