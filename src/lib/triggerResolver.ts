export type TriggerResolution = {
  code: string;        // e.g., 'utm_campaign', 'sales_inquiry', 'page_context', 'geo_locale', 'first_visit', ...
  type: string;        // 'manual' | 'campaign' | 'intent' | 'context' | 'locale' | 'lifecycle'
  why: string;         // human/debug: e.g., 'utm_campaign:diwali_2025'
};

export type TriggerContext = {
  /** Full URL (recommended) so we can parse query params */
  url?: string | null;
  /** Current path (e.g., /products/plan-pro). Used to derive page_context slug. */
  pathname?: string | null;
  /** Document referrer (optional, useful for analytics/edge cases) */
  referrer?: string | null;
  /** Locale chosen in widget (or browser language, like 'en', 'hi', 'kn', 'ta') */
  locale?: string | null;
  /** Has the visitor been seen before (cookie/localStorage)? */
  seenFlag?: boolean | null;
  /** Explicit manual override, e.g. '?trigger=support_help' or widget option */
  manualOverride?: string | null;

  /** Optional pre-parsed intent (if caller already read ?intent) */
  intent?: string | null;

  /** Optional UTM bag if caller already parsed it */
  utm?: {
    campaign?: string | null;
    source?: string | null;
    medium?: string | null;
    term?: string | null;
    content?: string | null;
  } | null;
};

// ---------------------- helpers ----------------------

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
  } catch {
    return new URLSearchParams();
  }
}

/** Normalise intent query into a supported system trigger code */
function normalizeIntent(raw?: string | null): string | null {
  const v = safeLower(raw);
  if (!v) return null;

  // Canonical system intent codes used in your templates dropdown
  const INTENTS = new Set([
    "sales_inquiry",
    "support_help",
    "demo_booking",
    "quote_request",
    "whatsapp_optin_confirm",
  ]);

  // Common aliases -> canonical
  const ALIASES: Record<string, string> = {
    sales: "sales_inquiry",
    pricing: "sales_inquiry",
    buy: "sales_inquiry",
    purchase: "sales_inquiry",

    support: "support_help",
    help: "support_help",

    demo: "demo_booking",
    book_demo: "demo_booking",

    quote: "quote_request",
    estimate: "quote_request",

    optin: "whatsapp_optin_confirm",
    subscribe: "whatsapp_optin_confirm",
    whatsapp_optin: "whatsapp_optin_confirm",
  };

  if (INTENTS.has(v)) return v;
  if (ALIASES[v]) return ALIASES[v];

  // try transforming sales-inquiry -> sales_inquiry, etc.
  const underscored = v.replace(/-/g, "_");
  if (INTENTS.has(underscored)) return underscored;

  return null;
}

// ---------------------- resolver ----------------------

/**
 * Resolve a single system trigger with deterministic priority:
 * manual > utm_campaign > intent > page_context > locale > lifecycle
 *
 * Returns undefined if nothing matches (caller should fall back to default).
 */
export function resolveSystemTrigger(ctx: TriggerContext): TriggerResolution | undefined {
  const search = parseFromUrlStr(ctx.url);

  // 1) manual (explicit override)
  {
    const manual = safeLower(ctx.manualOverride || search.get("trigger"));
    if (manual) {
      return {
        code: manual,
        type: "manual",
        why: manual:,
      };
    }
  }

  // 2) utm_campaign
  {
    const campaign = slugify(
      ctx.utm?.campaign ??
      search.get("utm_campaign")
    );
    if (campaign) {
      // We use a generic 'utm_campaign' template; pass value in 'why'
      return {
        code: "utm_campaign",
        type: "campaign",
        why: utm_campaign:,
      };
    }
  }

  // 3) intent (from ?intent=... or ctx.intent)
  {
    const intentParam = ctx.intent ?? search.get("intent");
    const intentCode = normalizeIntent(intentParam);
    if (intentCode) {
      return {
        code: intentCode,
        type: "intent",
        why: intent:,
      };
    }
  }

  // 4) page_context (derive from pathname)
  {
    const path = (ctx.pathname ?? "").trim();
    if (path && path !== "/") {
      // Use the full path (without leading slash) as context info
      const normalized = slugify(path.replace(/^\/+/, ""));
      if (normalized) {
        return {
          code: "page_context",
          type: "context",
          why: page_context:,
        };
      }
    }
  }

  // 5) locale (geo_locale system code)
  {
    const loc = slugify(ctx.locale);
    if (loc) {
      return {
        code: "geo_locale",
        type: "locale",
        why: locale:,
      };
    }
  }

  // 6) lifecycle (first_visit / returning_visit)
  {
    const seen = !!ctx.seenFlag;
    return {
      code: seen ? "returning_visit" : "first_visit",
      type: "lifecycle",
      why: seen ? "lifecycle:returning_visit" : "lifecycle:first_visit",
    };
  }
}
