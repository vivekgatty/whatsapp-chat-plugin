// src/app/api/business/save/route.ts
import { NextResponse } from "next/server";
// NOTE: relative path to avoid alias issues
import { getSupabaseAdmin } from "../../../../lib/getSupabaseAdmin()";

export const runtime = "nodejs";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const id = String(fd.get("id") || "").trim() || null;
    const name = String(fd.get("name") || "").trim() || null;
    const wa_number = String(fd.get("wa_number") || "").trim() || null;
    const timezone = String(fd.get("timezone") || "UTC").trim();

    // "online_override": "" | "online" | "offline"
    const oo = String(fd.get("online_override") || "");
    const online_override =
      oo === "online" ? true : oo === "offline" ? false : null;

    // Parse working hours from inputs like wh[mon][start], wh[mon][end], wh[mon][closed]
    const working_hours: Record<
      DayKey,
      { closed: boolean; start: string | null; end: string | null }
    > = {
      mon: { closed: true, start: null, end: null },
      tue: { closed: true, start: null, end: null },
      wed: { closed: true, start: null, end: null },
      thu: { closed: true, start: null, end: null },
      fri: { closed: true, start: null, end: null },
      sat: { closed: true, start: null, end: null },
      sun: { closed: true, start: null, end: null },
    };

    for (const d of DAYS) {
      const s = String(fd.get(`wh[${d}][start]`) || "").trim();
      const e = String(fd.get(`wh[${d}][end]`) || "").trim();
      const c = String(fd.get(`wh[${d}][closed]`) || "true"); // radios: "false" (Open) or "true" (Closed)
      working_hours[d] = {
        closed: c === "true",
        start: s || null,
        end: e || null,
      };
    }

    // Upsert businesses
    const payload: any = {
      name,
      wa_number,
      timezone,
      working_hours,
      online_override,
    };
    if (id) payload.id = id; // keep id only if provided

    const { error } = await getSupabaseAdmin()
      .from("businesses")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    // Redirect back to the dashboard page after POST (classic HTML form UX)
    return NextResponse.redirect(new URL("/dashboard/business", req.url), { status: 303 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server error" }, { status: 200 });
  }
}

