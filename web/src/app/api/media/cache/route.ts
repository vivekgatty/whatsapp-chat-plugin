import { NextResponse } from "next/server";
import { requireApiSession, userCanAccessBusiness } from "@/lib/apiAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sanitizeText } from "@/lib/utils/sanitize";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const businessId = sanitizeText(body.business_id, 60);
  const mediaId = sanitizeText(body.media_id, 120);
  if (!businessId || !mediaId) {
    return NextResponse.json({ ok: false, error: "business_id and media_id required" }, { status: 400 });
  }
  if (!(await userCanAccessBusiness(user.id, businessId))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN || "";
  if (!token) return NextResponse.json({ ok: false, error: "WHATSAPP_ACCESS_TOKEN missing" }, { status: 500 });

  // 1) Resolve temporary Meta CDN url
  const metaInfoRes = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaInfoRes.ok) {
    return NextResponse.json({ ok: false, error: "failed_to_resolve_meta_media" }, { status: 502 });
  }
  const metaInfo = (await metaInfoRes.json()) as { url?: string; mime_type?: string };
  const tempUrl = String(metaInfo.url || "");
  if (!tempUrl) return NextResponse.json({ ok: false, error: "meta_media_url_missing" }, { status: 502 });

  // 2) Download immediately (Meta URL expires in ~24h)
  const mediaRes = await fetch(tempUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!mediaRes.ok) return NextResponse.json({ ok: false, error: "failed_to_download_media" }, { status: 502 });
  const arrayBuffer = await mediaRes.arrayBuffer();

  // 3) Persist in Supabase Storage; return permanent URL only
  const admin = getSupabaseAdmin();
  const path = `${businessId}/${Date.now()}-${mediaId}`;
  const { error: upErr } = await admin.storage
    .from("media")
    .upload(path, arrayBuffer, {
      contentType: metaInfo.mime_type || "application/octet-stream",
      upsert: true,
    });
  if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

  const { data: pub } = admin.storage.from("media").getPublicUrl(path);

  await admin.from("media_assets").insert({
    business_id: businessId,
    media_id: mediaId,
    storage_path: path,
    public_url: pub.publicUrl,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, media_url: pub.publicUrl, storage_path: path });
}
