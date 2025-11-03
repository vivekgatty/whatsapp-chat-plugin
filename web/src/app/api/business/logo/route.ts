export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SKEY = process.env.SUPABASE_SERVICE_ROLE!;
const admin = createClient(URL, SKEY, { auth: { persistSession: false } });

const TABLE = "businesses";
const BUCKET = "logos";

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });

  const type = (file.type || "").toLowerCase();
  const okType = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!okType.includes(type))
    return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 400 });

  // ≤ 2MB
  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json({ ok: false, error: "too_big" }, { status: 400 });

  // bucket (idempotent)
  try {
    await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "2MB" });
  } catch {}

  const safeName = (file.name || "logo").replace(/[^\w.\-]+/g, "_");
  const ext = safeName.includes(".")
    ? safeName.split(".").pop()
    : type === "image/png"
      ? "png"
      : type === "image/jpeg"
        ? "jpg"
        : type === "image/webp"
          ? "webp"
          : "svg";
  const key = `${user.id}/logo.${ext}`;

  const up = await admin.storage
    .from(BUCKET)
    .upload(key, file, { upsert: true, contentType: type || undefined });
  if (up.error) return NextResponse.json({ ok: false, error: up.error.message }, { status: 500 });

  const pub = admin.storage.from(BUCKET).getPublicUrl(key);
  const logoUrl = pub?.data?.publicUrl;
  if (!logoUrl) return NextResponse.json({ ok: false, error: "no_public_url" }, { status: 500 });

  // Only update the logo column for this owner_id (no insert)
  const upd = await admin.from(TABLE).update({ logo_url: logoUrl }).eq("owner_id", user.id);
  if (upd.error) return NextResponse.json({ ok: false, error: upd.error.message }, { status: 500 });

  return NextResponse.json({ ok: true, logoUrl });
}
