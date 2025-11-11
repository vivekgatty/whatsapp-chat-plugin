import { NextResponse } from "next/server";
// IMPORTANT: relative import only (aliases broke earlier)
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

async function ensureBusinessByEmail(db: any, email: string): Promise<{ id: string | null; trace: any[] }> {
  const trace: any[] = [];

  const { data: found, error: findErr } = await db
    .from("businesses")
    .select("id")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) trace.push({ step: "find_business", error: findErr?.message || String(findErr) });
  if (found?.id) return { id: found.id as string, trace };

  const friendly = email.split("@")[0].replace(/[^a-zA-Z0-9 _.-]/g, "");
  const variants: Json[] = [
    { name: `${friendly || "My"}'s Business`, email, plan: "starter" },
    { name: `${friendly || "My"}'s Business`, email },
    { name: `${friendly || "My"}'s Business` },
  ];

  for (const v of variants) {
    const { data, error } = await db.from("businesses").insert(v as any).select("id").single();
    if (data?.id) {
      trace.push({ step: "create_business", variant: Object.keys(v), ok: true });
      return { id: data.id as string, trace };
    }
    trace.push({ step: "create_business", variant: Object.keys(v), error: error?.message || String(error) });

    if (error?.code === "23505") {
      const { data: again } = await db
        .from("businesses")
        .select("id")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (again?.id) return { id: again.id as string, trace };
    }
  }

  return { id: null, trace };
}

async function ensureWidgetForBusiness(db: any, businessId: string): Promise<{ id: string | null; trace: any[] }> {
  const trace: any[] = [];

  const { data: existing, error: findErr } = await db
    .from("widgets")
    .select("id")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) trace.push({ step: "find_widget", error: findErr?.message || String(findErr) });
  if (existing?.id) return { id: existing.id as string, trace };

  const { data, error } = await db.from("widgets").insert({ business_id: businessId } as any).select("id").single();
  if (data?.id) return { id: data.id as string, trace };

  trace.push({ step: "create_widget", error: error?.message || String(error) });
  return { id: null, trace };
}

async function handle(emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid 'email' is required." }, { status: 400 });
  }

  const db = supabaseAdmin();

  const biz = await ensureBusinessByEmail(db, email);
  if (!biz.id) {
    return reply({ widgetId: FALLBACK_WIDGET, source: "fallback_business_create", debug: biz.trace }, FALLBACK_WIDGET);
  }

  const wid = await ensureWidgetForBusiness(db, biz.id);
  if (!wid.id) {
    return reply(
      { widgetId: FALLBACK_WIDGET, source: "fallback_widget_create", debug: [...biz.trace, ...wid.trace] },
      FALLBACK_WIDGET
    );
  }

  return reply({ widgetId: wid.id, source: "resolved", debug: [...biz.trace, ...wid.trace] }, wid.id);
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

// Also allow GET: /api/resolve-widget?email=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  return handle(email);
}