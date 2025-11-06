export type TriggerResolution = {
  code: string;        // e.g., 'utm_campaign', 'sales_inquiry', 'page_context', 'geo_locale', 'first_visit', ...
  type: string;        // 'manual' | 'campaign' | 'intent' | 'context' | 'locale' | 'lifecycle'
  why: string;         // human/debug: e.g., 'utm_campaign:diwali_2025'
};

export type TriggerContext = {
  url?: string | null;
  pathname?: string | null;
  referrer?: string | null;
  locale?: string | null;
  seenFlag?: boolean | null;
  manualOverride?: string | null;
  intent?: string | null;
  utm?: {
    campaign?: string | null;
    source?: string | null;
    medium?: string | null;
    term?: string | null;
    content?: string | null;
  } | null;
};

function safeLower(s?: string | null): string {
  return (s ?? "").toString().trim().toLowerCase();
}
function slugify(s?: string | null): string {
  return safeLower(s).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function parseFromUrlStr(url?: string | null): URLSearchParams {
  try {
    if (!url) return new URLSearchParams();
    const u = new URL(url);
    return u.searchParams;
  } catch { return new URLSearchParams(); }
}
function normalizeIntent(raw?: string | null): string | null {
  const v = safeLower(raw);
  if (!v) return null;
  const INTENTS = new Set([
    "sales_inquiry","support_help","demo_booking","quote_request","whatsapp_optin_confirm",
  ]);
  const ALIASES: Record<string,string> = {
    sales:"sales_inquiry", pricing:"sales_inquiry", buy:"sales_inquiry", purchase:"sales_inquiry",
    support:"support_help", help:"support_help",
    demo:"demo_booking", book_demo:"demo_booking",
    quote:"quote_request", estimate:"quote_request",
    optin:"whatsapp_optin_confirm", subscribe:"whatsapp_optin_confirm", whatsapp_optin:"whatsapp_optin_confirm",
  };
  if (INTENTS.has(v)) return v;
  if (ALIASES[v]) return ALIASES[v];
  const underscored = v.replace(/-/g, "_");
  if (INTENTS.has(underscored)) return underscored;
  return null;
}

/** Priority: manual > utm_campaign > intent > page_context > locale > lifecycle */
export function resolveSystemTrigger(ctx: TriggerContext): TriggerResolution | undefined {
  const search = parseFromUrlStr(ctx.url);

  // 1) manual
  {
    const manual = safeLower(ctx.manualOverride || search.get("trigger"));
    if (manual) return { code: manual, type: "manual", why: manual: };
  }

  // 2) utm_campaign
  {
    const campaign = slugify(ctx.utm?.campaign ?? search.get("utm_campaign"));
    if (campaign) return { code: "utm_campaign", type: "campaign", why: utm_campaign: };
  }

  // 3) intent
  {
    const intentParam = ctx.intent ?? search.get("intent");
    const intentCode = normalizeIntent(intentParam);
    if (intentCode) return { code: intentCode, type: "intent", why: intent: };
  }

  // 4) page_context
  {
    const path = (ctx.pathname ?? "").trim();
    if (path && path !== "/") {
      const normalized = slugify(path.replace(/^\/+/, ""));
      if (normalized) return { code: "page_context", type: "context", why: page_context: };
    }
  }

  // 5) locale
  {
    const loc = slugify(ctx.locale);
    if (loc) return { code: "geo_locale", type: "locale", why: locale: };
  }

  // 6) lifecycle
  {
    const seen = !!ctx.seenFlag;
    return {
      code: seen ? "returning_visit" : "first_visit",
      type: "lifecycle",
      why: seen ? "lifecycle:returning_visit" : "lifecycle:first_visit",
    };
  }
}
