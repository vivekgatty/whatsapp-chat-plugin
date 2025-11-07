"use client";

import { useEffect, useState } from "react";

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
    else localStorage.removeItem(KEY);
  } catch {}
}

export function readWid(): string {
  try {
    return (localStorage.getItem(KEY) || "").trim();
  } catch {
    return "";
  }
}

/** Historical alias kept for compatibility with existing imports */
export const getWid = readWid;

/** Replace all <WIDGET_ID> placeholders with saved or provided wid. */
export function replaceWidPlaceholders(code: string, wid?: string): string {
  const val = (wid && wid.trim()) || readWid() || WID_PLACEHOLDER;
  return (code || "").replaceAll(WID_PLACEHOLDER, val);
}

/**
 * React hook for docs pages/components.
 * Returns [wid, setWidValue] and keeps state in sync with localStorage.
 */
export function useWid(): [string, (v: string) => void] {
  const [wid, set] = useState<string>("");

  useEffect(() => {
    // initialize from localStorage on mount
    set(readWid());

    // keep in sync across tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) set(readWid());
    };
    try { window.addEventListener("storage", onStorage); } catch {}

    return () => {
      try { window.removeEventListener("storage", onStorage); } catch {}
    };
  }, []);

  const write = (v: string) => {
    set(v);
    setWid(v);
  };

  return [wid, write];
}
