import { NextResponse } from "next/server";
// Keep RELATIVE import (aliases caused issues earlier)
import supabaseAdmin from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

type Json = Record<string, any>;

function reply(data: Json, widgetId?: string) {
  const res = NextResponse.json(data, { status: 200 });
  if (widgetId) {
    res.cookies.set("cm_widget_id", String(widgetId), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

async function findAuthUserIdByEmail(admin: any, email: string, trace: any[]): Promise<string | null> {
  // Search via listUsers pagination (SDK lacks getUserByEmail here)
  try {
    const perPage = 100;
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        trace.push({ step: "list_users_error", page, error: String(error.message || error) });
        break;
      }
      const found = (data?.users || []).find((u: any) => String(u?.email || "").toLowerCase() === email);
      if (found?.id) {
        trace.push({ step: "list_users_match", page, id: found.id });
        return found.id as string;
      }
      if (!data || (data.users || []).length < perPage) break;
    }
  } catch (e: any) {
    trace.push({ step: "list_users_exception", error: String(e?.message || e) });
  }

  // Not found → try to create
  try {
    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (data?.user?.id) {
      trace.push({ step: "create_user", id: data.user.id });
      return data.user.id as string;
    }
    if (error) trace.push({ step: "create_user_error", error: String(error.message || error) });
  } catch (e: any) {
    trace.push({ step: "create_user_exception", error: String(e?.message || e) });
  }

  // Re-scan a few pages—user might already exist
  try {
    const perPage = 100;
    for (let page = 1; page <= 3; page++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage });
      const found = (data?.users || []).find((u: any) => String(u?.email || "").toLowerCase() === email);
      if (found?.id) {
        trace.push({ step: "list_users_after_create", page, id: found.id });
        return found.id as string;
      }
      if (!data || (data.users || []).length < perPage) break;
    }
  } catch (e: any) {
    trace.push({ step: "post_create_list_exception", error: String(e?.message || e) });
  }

  return null;
}

async function ensureBusiness(admin: any, ownerId: string, email: string, trace: any[]): Promise<string | null> {
  // Prefer a business already owned by this user
  try {
    const { data, error } = await admin
      .from("businesses")
      .select("id")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) trace.push({ step: "find_business_owner_error", error: String(error.message || error) });
    if (data?.id) {
      trace.push({ step: "found_business_by_owner", id: data.id });
      return data.id as string;
    }
  } catch (e: any) {
    trace.push({ step: "find_business_owner_exception", error: String(e?.message || e) });
  }

  // Else look by email (might exist without owner_id)
  try {
    const { data } = await admin
      .from("businesses")
      .select("id, owner_id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      trace.push({ step: "found_business_by_email", id: data.id, owner_id: data.owner_id ?? null });
      if (!data.owner_id) {
        await admin.from("businesses").update({ owner_id: ownerId } as any).eq("id", data.id);
      }
      return data.id as string;
    }
  } catch (e: any) {
    trace.push({ step: "find_business_email_exception", error: String(e?.message || e) });
  }

  // Create minimal business with NOT NULL owner_id
  try {
    const friendly = (email.split("@")[0] || "My").replace(/[^a-zA-Z0-9 _.-]/g, "");
    const insert = { name: `${friendly}'s Business`, email, plan: "starter", owner_id: ownerId } as any;
    const { data, error } = await admin.from("businesses").insert(insert).select("id").single();
    if (error) trace.push({ step: "create_business_error", error: String(error.message || error) });
    if (data?.id) {
      trace.push({ step: "create_business_ok", id: data.id });
      return data.id as string;
    }
  } catch (e: any) {
    trace.push({ step: "create_business_exception", error: String(e?.message || e) });
  }

  return null;
}

async function ensureWidget(admin: any, businessId: string, trace: any[]): Promise<string | null> {
  try {
    const { data, error } = await admin
      .from("widgets")
      .select("id")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) trace.push({ step: "find_widget_error", error: String(error.message || error) });
    if (data?.id) {
      trace.push({ step: "found_widget", id: data.id });
      return data.id as string;
    }
  } catch (e: any) {
    trace.push({ step: "find_widget_exception", error: String(e?.message || e) });
  }

  try {
    const { data, error } = await admin.from("widgets").insert({ business_id: businessId } as any).select("id").single();
    if (error) trace.push({ step: "create_widget_error", error: String(error.message || error) });
    if (data?.id) {
      trace.push({ step: "create_widget_ok", id: data.id });
      return data.id as string;
    }
  } catch (e: any) {
    trace.push({ step: "create_widget_exception", error: String(e?.message || e) });
  }

  return null;
}

async function handle(emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid 'email' is required." }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const trace: any[] = [];

  const ownerId = await findAuthUserIdByEmail(admin, email, trace);
  if (!ownerId) {
    return reply({ widgetId: FALLBACK_WIDGET, source: "owner_lookup_failed", debug: trace }, FALLBACK_WIDGET);
  }

  const businessId = await ensureBusiness(admin, ownerId, email, trace);
  if (!businessId) {
    return reply({ widgetId: FALLBACK_WIDGET, source: "missing_owner_or_create_failed", debug: trace }, FALLBACK_WIDGET);
  }

  const widgetId = await ensureWidget(admin, businessId, trace);
  if (!widgetId) {
    return reply({ widgetId: FALLBACK_WIDGET, source: "widget_create_failed", debug: trace }, FALLBACK_WIDGET);
  }

  return reply({ widgetId, source: "resolved", debug: trace }, widgetId);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Json;
    return await handle(body?.email || "");
  } catch (err: any) {
    return reply(
      { widgetId: FALLBACK_WIDGET, source: "fallback_exception", message: String(err?.message || err) },
      FALLBACK_WIDGET
    );
  }
}

// Convenience: /api/resolve-widget?email=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  return handle(email);
}