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
  if (!businessId) return NextResponse.json({ ok: false, error: "business_id required" }, { status: 400 });
  if (!(await userCanAccessBusiness(user.id, businessId))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const limitRaw = Number(sp.get("limit") || 20);
  const limit = Math.min(20, Math.max(1, limitRaw));
  const offset = Math.max(0, Number(sp.get("offset") || 0));

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("conversations")
    .select("*", { count: "exact" })
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: data ?? [], pagination: { limit, offset, next_offset: offset + limit } });
}
