// src/app/api/dev/leads/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// NOTE: Server-only route. Uses SERVICE ROLE (bypasses RLS). DO NOT expose to browser clients.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Body = {
  business_id: string; // required
  name?: string;
  message?: string;
  utm_source?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.business_id) {
      return NextResponse.json(
        { ok: false, error: "business_id is required" },
        { status: 400 }
      );
    }

    const referrer = req.headers.get("referer") ?? null;

    const { data, error } = await supabase
      .from("leads")
      .insert({
        business_id: body.business_id,
        name: body.name ?? null,
        message: body.message ?? null,
        utm_source: body.utm_source ?? null,
        referrer,
      })
      .select("id, business_id, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
