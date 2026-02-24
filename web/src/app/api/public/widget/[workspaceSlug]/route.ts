import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnyRow = Record<string, unknown>;

function val<T = unknown>(row: AnyRow | null | undefined, keys: string[], fallback?: T): T | undefined {
  if (!row) return fallback;
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return fallback;
}

async function findBusinessBySlug(slug: string) {
  const db = getSupabaseAdmin();
  const attempts = ["workspace_slug", "slug", "id"];

  for (const col of attempts) {
    try {
      const { data } = await db
        .from("businesses")
        .select("*")
        .eq(col, slug)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) return data as AnyRow;
    } catch {
      // try next lookup column
    }
  }

  return null;
}

export async function GET(_req: Request, ctx: { params: Promise<{ workspaceSlug: string }> }) {
  try {
    const params = await ctx.params;
    const workspaceSlug = decodeURIComponent(params?.workspaceSlug || "").trim();
    if (!workspaceSlug) {
      return NextResponse.json({ ok: false, error: "Missing workspaceSlug" }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    const business = await findBusinessBySlug(workspaceSlug);
    if (!business) {
      return NextResponse.json({ ok: false, error: "Workspace not found" }, { status: 404 });
    }

    const businessId = String(val(business, ["id"]) || "");
    const { data: widget } = await db
      .from("widgets")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!widget) {
      return NextResponse.json({ ok: false, error: "Widget not found" }, { status: 404 });
    }

    const waDirect = val<string>(business, ["wa_number", "waNumber"]);
    const waCC = String(val(business, ["whatsapp_cc"], "") || "").replace(/[^\d+]/g, "");
    const waLocal = String(val(business, ["whatsapp_number"], "") || "").replace(/\D/g, "");
    const mergedWa = waDirect || (waLocal ? `${waCC || "+"}${waLocal}` : "");

    return NextResponse.json({
      ok: true,
      workspaceSlug,
      config: {
        id: val<string>(widget as AnyRow, ["id"], "") || "",
        workspaceSlug,
        waNumber: val<string>(widget as AnyRow, ["wa_number", "waNumber"], mergedWa || "") || "",
        themeColor: val<string>(widget as AnyRow, ["theme_color", "themeColor"], "#10b981") || "#10b981",
        icon: val<string>(widget as AnyRow, ["icon"], "whatsapp") || "whatsapp",
        ctaText: val<string>(widget as AnyRow, ["cta_text", "ctaText"], "Chat with us on WhatsApp") || "Chat with us on WhatsApp",
        prefillMessage: val<string>(widget as AnyRow, ["prefill_message", "prefillMessage"], "Hey! I'd like to know more.") || "Hey! I'd like to know more.",
        position: val<string>(widget as AnyRow, ["position"], "right") || "right",
        prechat: String(val(widget as AnyRow, ["prechat", "prechat_enabled"], "off") || "off"),
        requireName: Boolean(val(widget as AnyRow, ["require_name", "requireName"], true)),
        requireMessage: Boolean(val(widget as AnyRow, ["require_message", "requireMessage"], false)),
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
