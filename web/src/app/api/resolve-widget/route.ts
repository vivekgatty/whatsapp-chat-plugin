import { NextResponse } from "next/server";
// IMPORTANT: keep relative import (alias imports broke earlier)
import supabaseAdmin from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

type Json = Record<string, any>;

function respond(data: Json, widgetId?: string) {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Json;
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return bad("Valid 'email' is required in JSON body.");
    }

    const db = supabaseAdmin();

    // 1) Find or create business by email
    let businessId: string | null = null;

    const { data: bizFound } = await db
      .from("businesses")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (bizFound?.id) {
      businessId = bizFound.id as string;
    } else {
      const friendly = email.split("@")[0].replace(/[^a-zA-Z0-9 _.-]/g, "");
      const { data: bizNew, error: bizErr } = await db
        .from("businesses")
        .insert({
          name: `${friendly || "My"}'s Business`,
          email,
          plan: "starter",
        } as any)
        .select("id")
        .single();

      if (bizErr || !bizNew?.id) {
        return respond(
          { widgetId: FALLBACK_WIDGET, source: "fallback_business_create" },
          FALLBACK_WIDGET
        );
      }
      businessId = bizNew.id as string;
    }

    // 2) Find or create a widget for that business
    let widgetId: string | null = null;

    const { data: wFound } = await db
      .from("widgets")
      .select("id")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (wFound?.id) {
      widgetId = wFound.id as string;
    } else {
      const { data: wNew, error: wErr } = await db
        .from("widgets")
        .insert({ business_id: businessId } as any)
        .select("id")
        .single();

      if (wErr || !wNew?.id) {
        return respond(
          { widgetId: FALLBACK_WIDGET, source: "fallback_widget_create" },
          FALLBACK_WIDGET
        );
      }
      widgetId = wNew.id as string;
    }

    // 3) Set cookie + return
    return respond({ widgetId, source: "resolved" }, widgetId);
  } catch (err: any) {
    return respond(
      { widgetId: FALLBACK_WIDGET, source: "fallback_exception", message: String(err?.message || err) },
      FALLBACK_WIDGET
    );
  }
}