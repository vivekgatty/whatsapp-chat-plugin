export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SKEY = process.env.SUPABASE_SERVICE_ROLE!;
const admin = createClient(URL, SKEY, { auth: { persistSession: false } });

const BUCKET = "logos";
const TABLE  = "businesses";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED   = ["image/png","image/jpeg","image/webp","image/svg+xml"];

type Day = "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun";
type HoursRow = { open: string; close: string; closed: boolean };
type HoursMap = Record<Day, HoursRow>;
function defaultHours(): HoursMap {
  const base: HoursRow = { open: "09:00", close: "18:00", closed: false };
  return { mon:{...base}, tue:{...base}, wed:{...base}, thu:{...base}, fri:{...base}, sat:{...base}, sun:{...base, closed:true} };
}

export async function POST(req: Request) {
  const supa = await getSupabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok:false, error: "file_required" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok:false, error: "type_not_allowed" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok:false, error: "too_large" }, { status: 400 });

  try { await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "2MB", allowedMimeTypes: ALLOWED }); } catch {}

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const key = `${user.id}/${Date.now()}_${safeName}`;

  const up = await admin.storage.from(BUCKET).upload(key, file, { upsert: true, contentType: file.type });
  if (up.error) return NextResponse.json({ ok:false, error: up.error.message }, { status: 500 });

  const pub = admin.storage.from(BUCKET).getPublicUrl(key);
  const url = pub.data.publicUrl;

  // --- FIX: check existence first (owner_user_id OR owner_id) ---
  const existing = await admin
    .from(TABLE)
    .select("id")
    .or(`owner_user_id.eq.${user.id},owner_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json({ ok:false, error: existing.error.message }, { status: 500 });
  }

  if (existing.data?.id) {
    // Row exists → update only logo_url (no clobber)
    const upd = await admin.from(TABLE).update({ logo_url: url }).eq("id", existing.data.id);
    if (upd.error) return NextResponse.json({ ok:false, error: upd.error.message }, { status: 500 });
  } else {
    // No row yet → insert minimal valid row that satisfies NOT NULLs
    const ins = await admin.from(TABLE).insert({
      owner_user_id: user.id,
      owner_id: user.id,
      company_name: "",      // NOT NULL satisfied; user can fill later
      website: "",
      email: "",
      country: "IN",
      dial_code: null,
      phone: null,
      whatsapp_e164: null,
      hours: defaultHours(),
      logo_url: url
    }).select("id").maybeSingle();
    if (ins.error) return NextResponse.json({ ok:false, error: ins.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok:true, url });
}