// src/app/api/log/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type",
  "content-type": "application/json; charset=utf-8",
};

type LogBody = {
  event: "widget_view" | "chat_click" | "lead_submit" | "limit_reached" | "payment_success";
  business_id: string;
  widget_id?: string | null;
  page_url?: string | null;
  meta?: Record<string, unknown> | null;
};

export function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LogBody | null;
    if (!body?.event || !body?.business_id) {
      return new NextResponse(JSON.stringify({ ok: false, error: "Missing event or business_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
    );

    const ua = req.headers.get("user-agent") ?? null;
    const ref = req.headers.get("referer") ?? null;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      // @ts-expect-error env dependent
      (req as any)?.ip ||
      null;

    const { error } = await supabase.from("analytics").insert({
      event: body.event,
      business_id: body.business_id,
      widget_id: body.widget_id ?? null,
      page_url: body.page_url ?? null,
      referrer: ref,
      user_agent: ua,
      ip_address: ip,
      meta: body.meta ?? null,
    });

    if (error) {
      return new NextResponse(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new NextResponse(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new NextResponse(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
