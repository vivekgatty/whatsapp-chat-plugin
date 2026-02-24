// src/app/api/business/save/route.ts
import { NextResponse } from "next/server";
// NOTE: relative path to avoid alias issues
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireApiSession, userCanAccessBusiness } from "@/lib/apiAuth";
import { sanitizeText } from "@/lib/utils/sanitize";
import { encryptAccessToken } from "@/lib/utils/encryption";

export const runtime = "nodejs";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const user = await requireApiSession();
    if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const id = sanitizeText(fd.get("id"), 60) || null;
    const name = sanitizeText(fd.get("name"), 120) || null;
    const wa_number = sanitizeText(fd.get("wa_number"), 24) || null;
    const timezone = sanitizeText(fd.get("timezone"), 64) || "UTC";

    if (id && !(await userCanAccessBusiness(user.id, id))) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    // "online_override": "" | "online" | "offline"
    const oo = sanitizeText(fd.get("online_override"), 16);
    const online_override = oo === "online" ? true : oo === "offline" ? false : null;

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
      const s = sanitizeText(fd.get(`wh[${d}][start]`), 8);
      const e = sanitizeText(fd.get(`wh[${d}][end]`), 8);
      const c = sanitizeText(fd.get(`wh[${d}][closed]`), 8) || "true"; // radios: "false" (Open) or "true" (Closed)
      working_hours[d] = {
        closed: c === "true",
        start: s || null,
        end: e || null,
      };
    }


    const metaAccessTokenRaw = sanitizeText(fd.get("meta_access_token"), 1000);
    const encryptedMetaToken = metaAccessTokenRaw ? encryptAccessToken(metaAccessTokenRaw) : null;

    // Upsert businesses
    const payload: Record<string, unknown> = {
      name,
      wa_number,
      timezone,
      working_hours,
      online_override,
    };
    if (id) payload.id = id; // keep id only if provided
    if (encryptedMetaToken) {
      payload.meta_access_token_enc = encryptedMetaToken.cipherText;
      payload.meta_access_token_iv = encryptedMetaToken.iv;
      payload.meta_access_token_tag = encryptedMetaToken.authTag;
    }

    const { error } = await getSupabaseAdmin()
      .from("businesses")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    // Redirect back to the dashboard page after POST (classic HTML form UX)
    return NextResponse.redirect(new URL("/dashboard/business", req.url), { status: 303 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "server error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
