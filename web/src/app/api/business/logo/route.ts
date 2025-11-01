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

export async function POST(req: Request) {
  const supa = await getSupabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok:false, error: "file_required" }, { status: 400 });

  // Create bucket if missing (ignore "already exists" errors)
  try { await admin.storage.createBucket(BUCKET, { public: true }); } catch {}

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const key = `${user.id}/${Date.now()}_${safeName}`;

  const up = await admin.storage.from(BUCKET).upload(key, file, { upsert: true, contentType: file.type });
  if (up.error) return NextResponse.json({ ok:false, error: up.error.message }, { status: 500 });

  const pub = admin.storage.from(BUCKET).getPublicUrl(key);
  const url = pub.data.publicUrl;

  // Save to businesses.logo_url for this owner
  const save = await admin.from(TABLE).upsert({ owner_id: user.id, logo_url: url }, { onConflict: "owner_id" });
  if (save.error) return NextResponse.json({ ok:false, error: save.error.message }, { status: 500 });

  return NextResponse.json({ ok:true, url });
}