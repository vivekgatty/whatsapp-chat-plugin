export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SKEY = process.env.SUPABASE_SERVICE_ROLE!;
const admin = createClient(URL, SKEY, { auth: { persistSession: false } });

const TABLE = "businesses";

type Day = "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun";
type HoursRow = { open: string; close: string; closed: boolean };
type HoursMap = Record<Day, HoursRow>;

function defaultHours(): HoursMap {
  const base: HoursRow = { open: "09:00", close: "18:00", closed: false };
  return { mon:{...base}, tue:{...base}, wed:{...base}, thu:{...base}, fri:{...base}, sat:{...base}, sun:{...base, closed:true} };
}

function sanitize(input: any) {
  const hours = input?.hours && Object.keys(input.hours).length ? input.hours : defaultHours();
  const dial  = String(input?.dialCode ?? "").trim();
  const local = String(input?.phone ?? "").replace(/\D/g, "");
  const e164  = dial && local ? (dial + local) : null;

  return {
    company_name: String(input?.name ?? ""),  // map to NOT NULL column
    website:      String(input?.website ?? ""),
    email:        String(input?.email ?? ""),
    country:      String(input?.country ?? "IN"),
    dial_code:    dial || null,
    phone:        local || null,
    whatsapp_e164: e164,
    hours
  };
}

export async function GET() {
  const supa = await getSupabaseServer();
  const { data: { user } } = await supa.auth.getUser();

  const defaults = {
    name: "",
    website: "https://chatmadi.com",
    email: "admin@chatmadi.com",
    country: "IN",
    dialCode: "+91",
    phone: "",
    hours: defaultHours(),
    logoUrl: null as string | null
  };

  if (!user) return NextResponse.json({ ok: true, plan: "free", used: 0, quota: 100, business: defaults });

  const ex = await admin
    .from(TABLE)
    .select("id, company_name, website, email, country, dial_code, phone, hours, logo_url, whatsapp_e164")
    .or(`owner_user_id.eq.${user.id},owner_id.eq.${user.id}`)
    .limit(1).maybeSingle();

  if (ex.error) return NextResponse.json({ ok:false, error: ex.error.message, business: defaults }, { status: 500 });

  const b: any = ex.data ?? {};
  return NextResponse.json({
    ok: true,
    plan: "free", used: 0, quota: 100,
    business: {
      name: b.company_name ?? "",
      website: b.website ?? defaults.website,
      email: b.email ?? defaults.email,
      country: b.country ?? defaults.country,
      dialCode: b.dial_code ?? defaults.dialCode,
      phone: b.phone ?? defaults.phone,
      hours: b.hours ?? defaults.hours,
      logoUrl: b.logo_url ?? null
    }
  });
}

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error: "unauthorized" }, { status: 401 });

  const row  = sanitize(await req.json().catch(() => ({})));

  // Look up existing by either owner column
  const ex = await admin
    .from(TABLE)
    .select("id")
    .or(`owner_user_id.eq.${user.id},owner_id.eq.${user.id}`)
    .limit(1).maybeSingle();

  if (ex.error) return NextResponse.json({ ok:false, error: ex.error.message }, { status: 500 });

  if (ex.data?.id) {
    // Update existing row -> avoids duplicate key on owner_id unique index
    const upd = await admin.from(TABLE).update(row).eq("id", ex.data.id).select("*").maybeSingle();
    if (upd.error) return NextResponse.json({ ok:false, error: upd.error.message }, { status: 500 });
    const b: any = upd.data;
    return NextResponse.json({ ok: true, business: {
      name: b.company_name ?? "", website: b.website ?? "", email: b.email ?? "",
      country: b.country ?? "IN", dialCode: b.dial_code ?? null, phone: b.phone ?? null,
      hours: b.hours ?? defaultHours(), logoUrl: b.logo_url ?? null
    }});
  }

  // Insert a new one with BOTH owner columns set
  const ins = await admin.from(TABLE).insert({
    owner_user_id: user.id,
    owner_id: user.id,
    ...row
  }).select("*").maybeSingle();

  if (ins.error) return NextResponse.json({ ok:false, error: ins.error.message }, { status: 500 });

  const b: any = ins.data;
  return NextResponse.json({ ok: true, business: {
    name: b.company_name ?? "", website: b.website ?? "", email: b.email ?? "",
    country: b.country ?? "IN", dialCode: b.dial_code ?? null, phone: b.phone ?? null,
    hours: b.hours ?? defaultHours(), logoUrl: b.logo_url ?? null
  }});
}