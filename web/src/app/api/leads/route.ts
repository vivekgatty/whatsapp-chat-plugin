import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

type Body = {
  business_id: string;
  name?: string;
  message?: string;
  utm_source?: string;
};

function monthStartISO(d = new Date()) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
  return x.toISOString();
}

async function isPro(business_id: string) {
  const { data } = await sb
    .from("subscriptions")
    .select("status,current_period_end")
    .eq("business_id", business_id)
    .maybeSingle();

  if (!data) return false;
  if (data.status !== "active") return false;
  if (!data.current_period_end) return false;
  return new Date(data.current_period_end).getTime() > Date.now();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.business_id) {
      return NextResponse.json({ ok: false, error: "business_id is required" }, { status: 400 });
    }

    // check subscription
    const pro = await isPro(body.business_id);

    if (!pro) {
      // count leads this month
      const since = monthStartISO();
      const { count, error: cErr } = await sb
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("business_id", body.business_id)
        .gte("created_at", since);

      if (cErr) {
        return NextResponse.json({ ok: false, error: cErr.message }, { status: 500 });
      }

      if ((count || 0) >= 100) {
        return NextResponse.json(
          {
            ok: false,
            code: "limit_exceeded",
            message: "Free plan monthly limit reached. Upgrade to continue.",
            upgrade_url: "/dashboard/billing",
          },
          { status: 402 }
        );
      }
    }

    const referrer = (req.headers as any).get?.("referer") ?? null;

    const { data, error } = await sb
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
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
