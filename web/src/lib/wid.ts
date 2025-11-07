"use client";

/**
 * Helpers for storing/reading the user’s widget id in Docs,
 * and safely replacing <WIDGET_ID> placeholders in code blocks.
 */
const KEY = "docs_widget_id";
export const WID_PLACEHOLDER = "<WIDGET_ID>";

export function setWid(id: string) {
  try {
    const v = (id || "").trim();
    if (v) localStorage.setItem(KEY, v);
  } catch {}
}

export function readWid(): string {
  try {
    return (localStorage.getItem(KEY) || "").trim();
  } catch {
    return "";
  }
}

/** Historical name some components import. Keep it for compatibility. */
export const getWid = readWid;

/** Replace all <WIDGET_ID> placeholders with saved or provided wid. */
export function replaceWidPlaceholders(code: string, wid?: string): string {
  const val = (wid && wid.trim()) || readWid() || WID_PLACEHOLDER;
  return (code || "").replaceAll(WID_PLACEHOLDER, val);
}
