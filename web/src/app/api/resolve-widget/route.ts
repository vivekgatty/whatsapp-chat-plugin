import { NextResponse } from "next/server";
// keep relative import
import supabaseAdmin from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

type Json = Record<string, any>;

function reply(data: Json, widgetId?: string) {
  const res = NextResponse.json(data, { status: 200 });
  if (widgetId) {
    res.cookies.set("cm_widget_id", widgetId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

async function ensureBusiness(db: any, email: string, ownerId?: string) {
  // Prefer a business with same owner if provided
  let q = db.from("businesses")
    .select("id,owner_id,email")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let { data: found } = await q;
  if (found?.id) return { id: found.id as string, trace: [{ step: "found_business", id: found.id }] };

  // Need ownerId to create because schema enforces NOT NULL
  if (!ownerId) {
    return { id: null, trace: [{ step: "missing_owner_id" }] };
  }

  const friendly = email.split("@")[0].replace(/[^a-zA-Z0-9 _.-]/g, "");
  const { data: created, error: cErr } = await db
    .from("businesses")
    .insert({ name: `${friendly || "My"}'s Business`, email, plan: "starter", owner_id: ownerId } as any)
    .select("id")
    .single();

  if (created?.id) return { id: created.id as string, trace: [{ step: "create_business", ok: true }] };
  return { id: null, trace: [{ step: "create_business", error: cErr?.message || String(cErr) }] };
}

async function ensureWidget(db: any, businessId: string) {
  const { data: existing } = await db
    .from("widgets")
    .select("id")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return { id: existing.id as string, trace: [{ step: "found_widget", id: existing.id }] };

  const { data: created, error: wErr } = await db
    .from("widgets")
    .insert({ business_id: businessId } as any)
    .select("id")
    .single();

  if (created?.id) return { id: created.id as string, trace: [{ step: "create_widget", ok: true }] };
  return { id: null, trace: [{ step: "create_widget", error: wErr?.message || String(wErr) }] };
}

async function handle(req: Request) {
  // Accept both POST JSON and GET ?email=&owner_id=
  const url = new URL(req.url);
  let body: Json = {};
  try { body = await req.json(); } catch {}

  const email = String(body?.email || url.searchParams.get("email") || "").trim().toLowerCase();
  const ownerId = String(body?.owner_id || url.searchParams.get("owner_id") || "").trim() || undefined;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid 'email' is required." }, { status: 400 });
  }

  const db = supabaseAdmin();

  const biz = await ensureBusiness(db, email, ownerId);
  if (!biz.id) {
    return reply({ widgetId: FALLBACK_WIDGET, source: "missing_owner_or_create_failed", debug: biz.trace }, FALLBACK_WIDGET);
  }

  const wid = await ensureWidget(db, biz.id);
  if (!wid.id) {
    return reply({ widgetId: FALLBACK_WIDGET, source: "fallback_widget_create", debug: [...biz.trace, ...wid.trace] }, FALLBACK_WIDGET);
  }

  return reply({ widgetId: wid.id, source: "resolved", debug: [...biz.trace, ...wid.trace] }, wid.id);
}

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request)  { return handle(req); }