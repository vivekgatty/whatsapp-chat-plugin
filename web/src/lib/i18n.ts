export type Messages = Record<string, string>;

export const SUPPORTED = ["en", "hi", "kn", "ta"] as const;
export type Locale = typeof SUPPORTED[number];
const DEFAULT_LOCALE: Locale = "en";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const re = new RegExp(
    "(?:^|; )" + name.replace(/[-.$?*|{}()\[\\]\\/\\+^]/g, "\\$&") + "=([^;]*)"
  );
  const m = document.cookie.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

export function getLocale(): Locale {
  const raw = (typeof document !== "undefined" ? getCookie("cm_locale") : null) || DEFAULT_LOCALE;
  return (SUPPORTED as readonly string[]).includes(raw) ? (raw as Locale) : DEFAULT_LOCALE;
}

export function setLocale(loc: string): Locale {
  const val = (SUPPORTED as readonly string[]).includes(loc) ? (loc as Locale) : DEFAULT_LOCALE;
  if (typeof document !== "undefined") {
    document.cookie = `cm_locale=${encodeURIComponent(val)}; Max-Age=31536000; Path=/; SameSite=Lax`;
  }
  return val;
}

const cache: Record<string, Messages> = {};

export async function loadMessages(loc?: string): Promise<Messages> {
  const lang = loc || getLocale();
  if (cache[lang]) return cache[lang];
  try {
    const res = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
    const j = (await res.json()) as Messages;
    cache[lang] = j || {};
    return cache[lang];
  } catch {
    if (lang !== DEFAULT_LOCALE) {
      return loadMessages(DEFAULT_LOCALE);
    }
    return {};
  }
}

export function t(key: string, msgs: Messages, fallback?: string) {
  return (msgs && msgs[key]) ?? fallback ?? key;
}
