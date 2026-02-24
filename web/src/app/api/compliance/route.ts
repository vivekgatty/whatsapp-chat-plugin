import { NextResponse } from "next/server";
import { requireApiSession, userCanAccessBusiness } from "@/lib/apiAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sanitizeText } from "@/lib/utils/sanitize";

export const runtime = "nodejs";

type Action = "opt_out" | "export" | "delete";

async function ensureEnterprise(businessId: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("businesses")
    .select("plan")
    .eq("id", businessId)
    .maybeSingle();
  const plan = String(data?.plan || "").toLowerCase();
  return plan === "enterprise";
}

export async function POST(req: Request) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = sanitizeText(body.action, 20) as Action;
  const businessId = sanitizeText(body.business_id, 60);
  const contactId = sanitizeText(body.contact_id, 60);

  if (!businessId || !contactId || !action) {
    return NextResponse.json({ ok: false, error: "action, business_id, contact_id are required" }, { status: 400 });
  }

  if (!(await userCanAccessBusiness(user.id, businessId))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (!(await ensureEnterprise(businessId))) {
    return NextResponse.json({ ok: false, error: "enterprise_plan_required" }, { status: 402 });
  }

  const db = getSupabaseAdmin();

  if (action === "opt_out") {
    await db.from("contacts").update({ opted_out: true, updated_at: new Date().toISOString() }).eq("id", contactId).eq("business_id", businessId);
    return NextResponse.json({ ok: true, action, contact_id: contactId });
  }

  if (action === "export") {
    const { data: contact } = await db.from("contacts").select("*").eq("id", contactId).eq("business_id", businessId).maybeSingle();
    const { data: messages } = await db.from("messages").select("*").eq("contact_id", contactId).eq("business_id", businessId).order("created_at", { ascending: true });
    return NextResponse.json({ ok: true, action, export: { contact: contact || null, messages: messages || [] } });
  }

  if (action === "delete") {
    await db.from("messages").delete().eq("contact_id", contactId).eq("business_id", businessId);
    await db.from("contacts").delete().eq("id", contactId).eq("business_id", businessId);
    return NextResponse.json({ ok: true, action, deleted: true });
  }

  return NextResponse.json({ ok: false, error: "unsupported_action" }, { status: 400 });
}
