export type Locale = "en" | "hi" | "kn" | "ta";
export const LOCALES: Locale[] = ["en", "hi", "kn", "ta"];

import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import kn from "../i18n/kn.json";
import ta from "../i18n/ta.json";

const MAP: Record<Locale, Record<string, string>> = { en, hi, kn, ta };

function normalizeLocale(s?: string | null): Locale {
  const v = (s || "").toLowerCase().slice(0, 2) as Locale;
  return (LOCALES as readonly string[]).includes(v) ? v : "en";
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[-.$?*|{}()[\\]\\/+^]/g, "\\$&") + "=([^;]*)")
  );
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date(Date.now() + days * 864e5);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${d.toUTCString()}`;
}

export function getActiveLocale(): Locale {
  try {
    if (typeof window !== "undefined") {
      const urlLang = new URL(window.location.href).searchParams.get("lang");
      if (urlLang) return normalizeLocale(urlLang);
    }
    const fromCookie = getCookie("cm_locale");
    if (fromCookie) return normalizeLocale(fromCookie);
    if (typeof navigator !== "undefined") return normalizeLocale(navigator.language);
  } catch {}
  return "en";
}

export function setActiveLocale(loc: Locale) {
  setCookie("cm_locale", loc, 365);
}

export function t(key: string, loc?: Locale): string {
  const l = loc || getActiveLocale();
  const dict = MAP[l] || MAP.en;
  return dict[key] ?? MAP.en[key] ?? key;
}
