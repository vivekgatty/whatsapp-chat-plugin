export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../lib/supabaseAdmin";

type DayKey = "sun"|"mon"|"tue"|"wed"|"thu"|"fri"|"sat";
type Range = { start: string; end: string };
type Hours = Record<DayKey, Range[] | "closed" | undefined>;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const wid = (url.searchParams.get("wid") || "").trim();
    if (!wid) return NextResponse.json({ ok:false, error:"wid required" }, { status:400 });

    const supa = getSupabaseAdmin();
    const { data, error } = await supa
      .from("widget_hours")
      .select("widget_id,tz,hours,updated_at")
      .eq("widget_id", wid)
      .maybeSingle();

    if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 });
    if (!data) return NextResponse.json({ ok:true, exists:false, tz:"Asia/Kolkata", hours:{} });

    return NextResponse.json({ ok:true, exists:true, ...data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message||"unknown" }, { status:500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const wid = (body?.wid || "").trim();
    const tz  = (body?.tz  || "Asia/Kolkata").trim();
    const hours = (body?.hours || {}) as Hours;

    if (!wid) return NextResponse.json({ ok:false, error:"wid required" }, { status:400 });

    const supa = getSupabaseAdmin();
    const { data, error } = await supa
      .from("widget_hours")
      .upsert({ widget_id: wid, tz, hours })
      .select("widget_id,tz,hours,updated_at")
      .single();

    if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 });
    return NextResponse.json({ ok:true, saved:true, ...data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message||"unknown" }, { status:500 });
  }
}
