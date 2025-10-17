/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ---- Script version (bump to bust all caches if you change the code structure)
const SCRIPT_VERSION = "v0.3";

// ---- Runtime: Node.js (needed for crypto)
export const runtime = "nodejs";

type WidgetRow = {
  id: string;
  business_id: string;
  theme_color: string | null;
  icon: string | null;
  cta_text: string | null;
  position: "left" | "right" | null;
  prefill_message: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type BusinessRow = {
  id: string;
  wa_number: string | null;
};

function assertEnv(name: string, val: string | undefined): string {
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
}

function toIso(d: string | null | undefined): string {
  try {
    return d ? new Date(d).toUTCString() : new Date().toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

// Small helper to compute a stable ETag for the response
function computeETag(payload: unknown): string {
  const h = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  // Quote ETag per RFC
  return `"${h}"`;
}

// Simple UUID v4-ish check (enough to avoid junk)
function looksLikeUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(req: NextRequest) {
  try {
    // --- Parse query
    const { searchParams, origin } = new URL(req.url);
    const widgetId = searchParams.get("id")?.trim() ?? "";
    // Optional manual version param (e.g., ?v=123) so you can bust caches from HTML if you want
    const _v = searchParams.get("v")?.trim() ?? undefined;

    if (!widgetId || !looksLikeUuid(widgetId)) {
      return new Response("/* missing or invalid ?id */", {
        status: 400,
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    // --- Supabase (Service Role) — server-only
    const SUPABASE_URL = assertEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
    const SERVICE_KEY = assertEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // Fetch widget
    const { data: widget, error: wErr } = await supabase
      .from("widgets")
      .select("*")
      .eq("id", widgetId)
      .single<WidgetRow>();

    if (wErr || !widget) {
      return new Response("/* widget not found */", {
        status: 404,
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    // Fetch business to get wa_number
    const { data: business, error: bErr } = await supabase
      .from("businesses")
      .select("id, wa_number")
      .eq("id", widget.business_id)
      .single<BusinessRow>();

    if (bErr || !business) {
      return new Response("/* business not found */", {
        status: 404,
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    // ---- Prepare config for the client
    const CFG = {
      id: widget.id,
      business_id: widget.business_id,
      wa_number: business.wa_number ?? "",
      theme_color: widget.theme_color ?? "#10b981",
      icon: (widget.icon ?? "whatsapp").toLowerCase(), // "whatsapp" | "message"
      cta_text: widget.cta_text ?? "Chat with us on WhatsApp",
      position: (widget.position ?? "right") as "left" | "right",
      prefill_message: widget.prefill_message ?? "Hey! I’d like to know more.",
      apiBase: origin, // we’ll POST analytics to {origin}/api/log
    };

    // Build ETag from version + config (changes when widget fields change)
    const etag = computeETag({ SCRIPT_VERSION, CFG });

    // Conditional request?
    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
          ETag: etag,
          "Last-Modified": toIso(widget.updated_at ?? widget.created_at ?? null),
          Vary: "If-None-Match",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // ---- The script body
    // Keep the code readable; serve a single IIFE that creates the bubble, logs analytics,
    // and opens WhatsApp with prefilled message.
    const js = `(() => {
  // WhatsApp Chat Plugin — widget ${SCRIPT_VERSION}
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var CFG = ${JSON.stringify(CFG)};

  // Prevent double-inject
  if (window.__WCP_BUBBLE__) return;
  window.__WCP_BUBBLE__ = true;

  function logEvent(event) {
    try {
      var meta = { referrer: document.referrer || null };
      fetch(CFG.apiBase + "/api/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: event,
          business_id: CFG.business_id,
          widget_id: CFG.id,
          page_url: location.href,
          meta: meta
        })
      }).catch(function(){});
    } catch (e) {}
  }

  // Create bubble
  var btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", CFG.cta_text + " | Chat on WhatsApp");
  btn.style.cssText = [
    "position:fixed",
    "z-index:2147483647",
    "bottom:24px",
    (CFG.position === "left" ? "left:24px" : "right:24px"),
    "width:56px",
    "height:56px",
    "display:inline-flex",
    "align-items:center",
    "justify-content:center",
    "border-radius:9999px",
    "border:0",
    "cursor:pointer",
    "box-shadow:0 8px 24px rgba(0,0,0,.18)",
    "background:" + CFG.theme_color,
    "color:#fff",
    "transition:transform .08s ease, filter .12s ease"
  ].join(";");

  btn.onmouseenter = function(){ btn.style.filter = "brightness(1.05)"; };
  btn.onmouseleave = function(){ btn.style.filter = "none"; };
  btn.onmousedown = function(){ btn.style.transform = "scale(0.98)"; };
  btn.onmouseup = function(){ btn.style.transform = "scale(1)"; };

  // Simple icon: default "whatsapp" uses a glyph; "message" draws a chat bubble
  var ico = document.createElement("div");
  ico.style.cssText = "width:24px;height:24px;display:block;";

  if (CFG.icon === "message") {
    ico.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M2 5.5A3.5 3.5 0 0 1 5.5 2h13A3.5 3.5 0 0 1 22 5.5v7A3.5 3.5 0 0 1 18.5 16H9l-4.5 4.5a.75.75 0 0 1-1.28-.53V16A3.5 3.5 0 0 1 2 12.5v-7z"/></svg>';
  } else {
    // whatsapp
    ico.innerHTML = '<svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M19.11 17.09c-.3-.15-1.73-.85-1.99-.95-.27-.1-.46-.15-.65.15-.19.3-.74.95-.91 1.14-.17.19-.34.21-.64.06-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.19-.3.3-.5.1-.19.06-.38-.03-.53-.1-.15-.65-1.56-.89-2.14-.24-.58-.48-.5-.65-.5h-.56c-.19 0-.5.07-.76.38-.26.3-1 1-1 2.43 0 1.43 1.02 2.82 1.17 3.01.15.19 2.02 3.09 4.9 4.33.69.3 1.23.48 1.65.61.69.22 1.31.19 1.8.12.55-.08 1.73-.71 1.98-1.4.24-.69.24-1.28.17-1.4-.07-.12-.27-.19-.57-.34z"/><path d="M26.64 5.35A12.93 12.93 0 0 0 16.02 1C8.85 1 3 6.83 3 13.97c0 2.3.61 4.54 1.77 6.53L3 31l10.7-1.79c1.93 1.06 4.1 1.62 6.32 1.62 7.17 0 13.02-5.83 13.02-12.97 0-3.47-1.39-6.74-3.96-9.51zM20.02 27.9c-2.01 0-3.98-.54-5.7-1.56l-.41-.24-6.34 1.06 1.09-6.17-.26-.45A11 11 0 0 1 5.02 13.97C5.02 7.92 10 3 16.02 3c2.91 0 5.63 1.12 7.68 3.15a10.9 10.9 0 0 1 3.3 7.82c0 6.05-4.98 10.93-10.98 10.93z"/></svg>';
  }
  btn.appendChild(ico);

  btn.onclick = function() {
    try { logEvent("chat_click"); } catch(e) {}
    var base = "https://api.whatsapp.com/send";
    var text = encodeURIComponent(CFG.prefill_message || "");
    var url = base + "?phone=" + encodeURIComponent(CFG.wa_number || "") + "&text=" + text;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  document.body.appendChild(btn);

  // Analytics: widget view
  try { logEvent("widget_view"); } catch(e) {}
})();`;

    // ---- Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      ETag: etag,
      "Last-Modified": toIso(widget.updated_at ?? widget.created_at ?? null),
      Vary: "If-None-Match",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    };

    return new Response(js, { status: 200, headers });
  } catch (err: any) {
    return new Response(`/* widget error: ${err?.message ?? "unknown"} */`, {
      status: 500,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }
}
