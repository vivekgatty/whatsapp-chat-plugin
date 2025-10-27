import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  business_id: string;
  name?: string;
  message?: string;
  utm_source?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Body>;
    const business_id = body.business_id?.trim();
    if (!business_id) {
      return NextResponse.json(
        { ok: false, error: "business_id is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const referrer = req.headers.get("referer");

    const { data, error } = await supabase
      .from("leads")
      .insert({
        business_id,
        name: body.name ?? null,
        message: body.message ?? null,
        utm_source: body.utm_source ?? null,
        referrer: referrer ?? null,
      })
      .select("id,business_id,created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
