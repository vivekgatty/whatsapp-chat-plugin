import { NextRequest, NextResponse } from "next/server";
import { requireApiSession, userCanAccessBusiness } from "@/lib/apiAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sanitizeText } from "@/lib/utils/sanitize";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const businessId = sanitizeText(sp.get("business_id"), 60);
  const conversationId = sanitizeText(sp.get("conversation_id"), 60);
  if (!businessId || !conversationId) {
    return NextResponse.json({ ok: false, error: "business_id and conversation_id required" }, { status: 400 });
  }
  if (!(await userCanAccessBusiness(user.id, businessId))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const limitRaw = Number(sp.get("limit") || 20);
  const limit = Math.min(20, Math.max(1, limitRaw));
  const before = sanitizeText(sp.get("before"), 60);

  let q = getSupabaseAdmin()
    .from("messages")
    .select("*")
    .eq("business_id", businessId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) q = q.lt("created_at", before);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: data ?? [] });
}
