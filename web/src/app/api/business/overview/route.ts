export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SKEY = process.env.SUPABASE_SERVICE_ROLE!;
const admin = createClient(URL, SKEY, { auth: { persistSession: false } });

type Day = "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun";
type HoursRow = { open: string; close: string; closed: boolean };
type HoursMap = Record<Day, HoursRow>;
const TABLE = "businesses";

function defaultHours(): HoursMap {
  const base: HoursRow = { open: "09:00", close: "18:00", closed: false };
  return { mon:{...base}, tue:{...base}, wed:{...base}, thu:{...base}, fri:{...base}, sat:{...base}, sun:{...base, closed:true} };
}

async function getUser() {
  const supa = await getSupabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  return user;
}

function sanitize(input: any) {
  const hours = input?.hours && Object.keys(input.hours).length ? input.hours : defaultHours();
  const dial  = String(input?.dialCode ?? "").trim();
  const local = String(input?.phone ?? "").replace(/\D/g, "");
  const e164  = dial && local ? (dial + local) : null;
  return {
    name: String(input?.name ?? ""),
    website: String(input?.website ?? ""),
    email: String(input?.email ?? ""),
    country: String(input?.country ?? "IN"),
    dial_code: dial || null,
    phone: local || null,
    whatsapp_e164: e164,
    hours,
    logo_url: input?.logoUrl ?? null
  };
}

export async function GET() {
  const defaults = {
    name: "", website: "https://chatmadi.com", email: "admin@chatmadi.com",
    country: "IN", dialCode: "+91", phone: "", hours: defaultHours(), logoUrl: null
  };

  const user = await getUser();
  if (!user) return NextResponse.json({ ok: true, plan: "free", used: 0, quota: 100, business: defaults });

  const { data, error } = await admin.from(TABLE).select("*").eq("owner_user_id", user.id).limit(1).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message, business: defaults }, { status: 500 });

  const b: any = data ?? {};
  return NextResponse.json({
    ok: true, plan: "free", used: 0, quota: 100,
    business: {
      name: b.name ?? "", website: b.website ?? defaults.website, email: b.email ?? defaults.email,
      country: b.country ?? defaults.country, dialCode: b.dial_code ?? defaults.dialCode,
      phone: b.phone ?? defaults.phone, hours: b.hours ?? defaults.hours, logoUrl: b.logo_url ?? null
    }
  });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const row  = sanitize(body);
  const payload = { owner_user_id: user.id, owner_id: user.id, ...row };

  const { data, error } = await admin
    .from(TABLE)
    .upsert(payload, { onConflict: "owner_user_id" })
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, business: data });
}