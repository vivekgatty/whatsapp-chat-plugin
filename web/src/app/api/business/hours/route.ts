export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const bid = u.searchParams.get("bid");
    const wid = u.searchParams.get("wid");
    const supa = getSupabaseAdmin();

    let businessId = bid;
    if (!businessId && wid) {
      const w = await supa.from("widgets").select("business_id").eq("id", wid).maybeSingle();
      businessId = (w.data?.business_id as string | null) || null;
    }

    if (!businessId) {
      return NextResponse.json({
        ok: true,
        from: "default",
        timezone: "Asia/Kolkata",
        hours: {
          mon:{open:"09:30",close:"18:30",closed:false},
          tue:{open:"09:30",close:"18:30",closed:false},
          wed:{open:"09:30",close:"18:30",closed:false},
          thu:{open:"09:30",close:"18:30",closed:false},
          fri:{open:"09:30",close:"18:30",closed:false},
          sat:{open:"10:00",close:"16:00",closed:false},
          sun:{closed:true}
        }
      });
    }

    const { data, error } = await supa
      .from("businesses")
      .select("timezone,hours")
      .eq("id", businessId)
      .maybeSingle();

    if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 });

    return NextResponse.json({
      ok: true,
      from: "db",
      timezone: data?.timezone || "Asia/Kolkata",
      hours: data?.hours || {
        mon:{open:"09:30",close:"18:30",closed:false},
        tue:{open:"09:30",close:"18:30",closed:false},
        wed:{open:"09:30",close:"18:30",closed:false},
        thu:{open:"09:30",close:"18:30",closed:false},
        fri:{open:"09:30",close:"18:30",closed:false},
        sat:{open:"10:00",close:"16:00",closed:false},
        sun:{closed:true}
      }
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "unknown" }, { status:500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supa = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));
    const bid  = (body?.bid || "").trim();
    const wid  = (body?.wid || "").trim();
    const tz   = (body?.timezone || "").trim();
    const hours = body?.hours;

    let businessId = bid || null;
    if (!businessId && wid) {
      const w = await supa.from("widgets").select("business_id").eq("id", wid).maybeSingle();
      businessId = (w.data?.business_id as string | null) || null;
    }

    if (!businessId) {
      return NextResponse.json({ ok:false, error:"Provide bid or wid linked to a business" }, { status:400 });
    }

    const patch:any = {};
    if (tz) patch.timezone = tz;
    if (hours) patch.hours = hours;

    if (!Object.keys(patch).length) {
      return NextResponse.json({ ok:false, error:"Nothing to update" }, { status:400 });
    }

    const { error } = await supa.from("businesses").update(patch).eq("id", businessId);
    if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 });

    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "unknown" }, { status:500 });
  }
}
