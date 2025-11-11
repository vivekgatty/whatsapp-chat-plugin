import { NextResponse } from "next/server";
// IMPORTANT: relative import only (aliases caused issues before)
import supabaseAdmin from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

type Json = Record<string, any>;
function ok(data: Json, widgetId?: string) {
  const res = NextResponse.json(data, { status: 200 });
  if (widgetId) {
    res.cookies.set("cm_widget_id", widgetId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  return res;
}
function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function ensureOwnerIdByEmail(db: any, email: string) {
  const trace: any[] = [];
  let ownerId: string | null = null;

  try {
    const { data, error } = await db.auth.admin.getUserByEmail(email);
    if (data?.user?.id) {
      ownerId = data.user.id as string;
      trace.push({ step: "found_owner", id: ownerId });
    } else if (error) {
      trace.push({ step: "get_owner_error", error: String(error?.message || error) });
    }
  } catch (e: any) {
    trace.push({ step: "get_owner_exception", error: String(e?.message || e) });
  }

  if (!ownerId) {
    try {
      const { data, error } = await db.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (data?.user?.id) {
        ownerId = data.user.id as string;
        trace.push({ step: "created_owner", id: ownerId });
      } else if (error) {
        trace.push({ step: "create_owner_error", error: String(error?.message || error) });
      }
    } catch (e: any) {
      trace.push({ step: "create_owner_exception", error: String(e?.message || e) });
    }
  }

  return { ownerId, trace };
}

async function ensureBusiness(db: any, ownerId: string, email: string) {
  const trace: any[] = [];

  // prefer an existing business for this owner
  const { data: found, error: findErr } = await db
    .from("businesses")
    .select("id")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) trace.push({ step: "find_business_error", error: String(findErr?.message || findErr) });
  if (found?.id) {
    trace.push({ step: "found_business", id: found.id });
    return { id: found.id as string, trace };
  }

  const friendly = (email.split("@")[0] || "My").replace(/[^a-zA-Z0-9 _.-]/g, "");
  const { data: created, error: createErr } = await db
    .from("businesses")
    .insert({ owner_id: ownerId, name: `${friendly}'s Business`, email, plan: "starter" } as any)
    .select("id")
    .single();

  if (created?.id) {
    trace.push({ step: "created_business", id: created.id });
    return { id: created.id as string, trace };
  }

  trace.push({ step: "create_business_error", error: String(createErr?.message || createErr) });
  return { id: null, trace };
}

async function ensureWidget(db: any, businessId: string) {
  const trace: any[] = [];

  const { data: wFound, error: wFindErr } = await db
    .from("widgets")
    .select("id")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (wFindErr) trace.push({ step: "find_widget_error", error: String(wFindErr?.message || wFindErr) });
  if (wFound?.id) {
    trace.push({ step: "found_widget", id: wFound.id });
    return { id: wFound.id as string, trace };
  }

  const { data: wNew, error: wErr } = await db
    .from("widgets")
    .insert({ business_id: businessId } as any)
    .select("id")
    .single();

  if (wNew?.id) {
    trace.push({ step: "created_widget", id: wNew.id });
    return { id: wNew.id as string, trace };
  }

  trace.push({ step: "create_widget_error", error: String(wErr?.message || wErr) });
  return { id: null, trace };
}

async function handle(emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return bad("Valid 'email' is required.");
  }

  const db = supabaseAdmin();
  const debug: any[] = [];

  const owner = await ensureOwnerIdByEmail(db, email);
  debug.push(...owner.trace);
  if (!owner.ownerId) {
    return ok({ widgetId: FALLBACK_WIDGET, source: "owner_lookup_failed", debug }, FALLBACK_WIDGET);
  }

  const biz = await ensureBusiness(db, owner.ownerId, email);
  debug.push(...biz.trace);
  if (!biz.id) {
    return ok({ widgetId: FALLBACK_WIDGET, source: "business_create_failed", debug }, FALLBACK_WIDGET);
  }

  const wid = await ensureWidget(db, biz.id);
  debug.push(...wid.trace);
  if (!wid.id) {
    return ok({ widgetId: FALLBACK_WIDGET, source: "widget_create_failed", debug }, FALLBACK_WIDGET);
  }

  return ok({ widgetId: wid.id, source: "resolved", debug }, wid.id);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Json;
    return await handle(body?.email || "");
  } catch (err: any) {
    return ok(
      { widgetId: FALLBACK_WIDGET, source: "fallback_exception", message: String(err?.message || err) },
      FALLBACK_WIDGET
    );
  }
}

// Convenience for manual test: /api/resolve-widget?email=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  return handle(email);
}