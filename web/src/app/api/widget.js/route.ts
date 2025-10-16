// src/app/api/widget.js/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type WidgetJoin = {
  id: string | null;
  theme_color: string | null;
  position: "left" | "right" | null;
  prefill_message: string | null;
  cta_text: string | null;
  businesses: { wa_number: string | null } | null;
};

/**
 * Public embed script.
 * Usage: <script src="https://<your-domain>/api/widget.js?id=<WIDGET_ID>" async></script>
 * If ?id is missing, we fall back to the most-recent widget (dev convenience).
 */
export async function GET(req: Request) {
  // --- 1) Read widget (and business WA number) on the server
  const url = new URL(req.url);
  const widgetId = url.searchParams.get("id");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // SERVICE ROLE is OK here: runs server-side only; never shipped to browser.
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Join widgets -> businesses (to get wa_number)
  const sel =
    "id,theme_color,position,prefill_message,cta_text,businesses:business_id(wa_number)";

  const base = supabase
    .from("widgets")
    .select(sel)
    .order("created_at", { ascending: false });

  const { data, error } = widgetId
    ? await base.eq("id", widgetId).limit(1).maybeSingle()
    : await base.limit(1).maybeSingle();

  const row = (data ?? null) as unknown as WidgetJoin | null;

  // Basic fallback if not found
  const waNumber = row?.businesses?.wa_number ?? "+919876543210";

  const config = {
    id: row?.id ?? null,
    theme: row?.theme_color ?? "#10b981",
    position: row?.position ?? "right",
    cta: row?.cta_text ?? "Chat on WhatsApp",
    prefill: row?.prefill_message ?? "Hi! I have a quick question.",
    wa: String(waNumber),
    error: error?.message ?? null,
  };

  // Sanitize phone for wa.me
  const waDigits = config.wa.replace(/[^\d]/g, "");
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(config.prefill)}`;

  // --- 2) Emit client-side script that injects the bubble
  const payload = { ...config, waHref };

  const js = `(() => {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      var CFG = ${JSON.stringify(payload)};
      if (CFG.error) { console.warn('[WCP] config error:', CFG.error); }

      // Avoid double-inject
      if (document.getElementById('wcp-bubble')) return;

      // Create styles
      var bubble = document.createElement('button');
      bubble.id = 'wcp-bubble';
      bubble.type = 'button';
      bubble.setAttribute('aria-label', CFG.cta || 'WhatsApp chat');
      bubble.style.position = 'fixed';
      bubble.style.zIndex = '2147483647';
      bubble.style.bottom = '24px';
      bubble.style[CFG.position === 'left' ? 'left' : 'right'] = '24px';
      bubble.style.width = '56px';
      bubble.style.height = '56px';
      bubble.style.borderRadius = '9999px';
      bubble.style.border = 'none';
      bubble.style.cursor = 'pointer';
      bubble.style.background = CFG.theme || '#10b981';
      bubble.style.boxShadow = '0 10px 15px rgba(0,0,0,.2), 0 4px 6px rgba(0,0,0,.2)';
      bubble.style.display = 'flex';
      bubble.style.alignItems = 'center';
      bubble.style.justifyContent = 'center';

      // Simple WhatsApp icon (inline SVG)
      bubble.innerHTML = '<svg viewBox="0 0 32 32" width="28" height="28" fill="#fff" aria-hidden="true"><path d="M19.11 17.4c-.3-.16-1.79-.88-2.06-.98-.27-.1-.46-.16-.65.16-.19.32-.75.98-.92 1.18-.17.19-.34.22-.64.08-.3-.16-1.24-.46-2.36-1.47-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.47.13-.63.13-.13.3-.34.44-.51.14-.17.19-.3.3-.49.1-.19.05-.37-.03-.52-.08-.16-.65-1.56-.9-2.14-.24-.57-.49-.49-.65-.49-.16 0-.35-.02-.54-.02-.19 0-.5.07-.76.37-.26.3-1 1-1 2.42 0 1.42 1.03 2.8 1.18 2.99.16.19 2.03 3.09 4.92 4.21.69.3 1.23.48 1.65.62.69.22 1.32.19 1.82.11.55-.08 1.79-.73 2.04-1.43.25-.7.25-1.3.17-1.43-.08-.13-.27-.2-.57-.35z"/><path d="M26.02 5.98C23.21 3.17 19.7 1.66 16 1.66 8.65 1.66 2.65 7.66 2.65 15c0 2.33.61 4.59 1.77 6.59L2 30l8.6-2.26a13.07 13.07 0 0 0 5.4 1.19h0c7.35 0 13.35-6 13.35-13.35 0-3.57-1.39-6.93-3.93-9.4zM16 27.19h0c-1.73 0-3.42-.46-4.9-1.34l-.35-.21-5.1 1.35 1.36-4.97-.23-.38a11.83 11.83 0 0 1-1.71-6c0-6.53 5.32-11.85 11.85-11.85 3.16 0 6.12 1.23 8.35 3.46a11.76 11.76 0 0 1 3.48 8.39c0 6.53-5.32 11.85-11.85 11.85z"/></svg>';

      bubble.addEventListener('click', function() {
        if (!CFG.waHref) return;
        try { window.open(CFG.waHref, '_blank', 'noopener'); }
        catch (e) { location.href = CFG.waHref; }
      });

      document.body.appendChild(bubble);
      console.log('[WCP] bubble injected', CFG);
    } catch (e) {
      console.error('[WCP] widget error', e);
    }
  })();`;

  return new NextResponse(js, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
