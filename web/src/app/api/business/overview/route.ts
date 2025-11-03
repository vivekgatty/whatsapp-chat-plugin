export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type HoursRow = { open: string; close: string; closed: boolean };
type HoursMap = Record<Day, HoursRow>;

function defaultHours(): HoursMap {
  const base: HoursRow = { open: "09:00", close: "18:00", closed: false };
  return {
    mon: { ...base },
    tue: { ...base },
    wed: { ...base },
    thu: { ...base },
    fri: { ...base },
    sat: { ...base },
    sun: { ...base, closed: true },
  };
}

async function getUser() {
  const supa = await getSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  return user;
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SKEY = process.env.SUPABASE_SERVICE_ROLE!; // service role (server only)
const admin = createClient(URL, SKEY, { auth: { persistSession: false } });

const TABLE = "businesses";

function sanitize(input: any) {
  const hours = input?.hours && Object.keys(input.hours).length ? input.hours : defaultHours();
  const dial = String(input?.dialCode ?? "").trim();
  const local = String(input?.phone ?? "").replace(/\D/g, "");
  const e164 = dial && local ? dial + local : null;
  const name = String(input?.name ?? "").trim();

  return {
    company_name: name || null, // map to DB
    name: name || null, // keep both safe
    website: String(input?.website ?? "") || null,
    email: String(input?.email ?? "") || null,
    country: String(input?.country ?? "IN") || "IN",
    dial_code: dial || null,
    phone: local || null,
    whatsapp_e164: e164,
    hours,
  };
}

export async function GET() {
  const defaults = {
    name: "",
    website: "https://chatmadi.com",
    email: "admin@chatmadi.com",
    country: "IN",
    dialCode: "+91",
    phone: "",
    hours: defaultHours(),
    logoUrl: undefined as string | undefined,
  };

  const user = await getUser();
  if (!user) return NextResponse.json({ ok: true, business: defaults });

  const { data, error } = await admin
    .from(TABLE)
    .select("*")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message, business: defaults },
      { status: 500 }
    );
  }

  const b: any = data ?? {};
  return NextResponse.json({
    ok: true,
    business: {
      name: (b.company_name ?? b.name ?? "") as string,
      website: b.website ?? defaults.website,
      email: b.email ?? defaults.email,
      country: b.country ?? defaults.country,
      dialCode: b.dial_code ?? defaults.dialCode,
      phone: b.phone ?? defaults.phone,
      hours: b.hours ?? defaults.hours,
      logoUrl: b.logo_url ?? undefined,
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const row = sanitize(body);
  const payload = { owner_id: user.id, ...row };

  // Upsert by owner_id (matches unique index businesses_owner_id_key)
  const { data, error } = await admin
    .from(TABLE)
    .upsert(payload, { onConflict: "owner_id" })
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, business: data });
}
