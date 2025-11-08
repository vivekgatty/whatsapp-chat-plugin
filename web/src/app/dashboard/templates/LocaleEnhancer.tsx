"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement for the Templates page:
 * - Fetches /api/locales (or falls back to existing options if it fails)
 * - Replaces the language <select> options with the full master list
 * - Preserves current selection and dispatches a change event
 *
 * This is intentionally DOM-level to avoid refactoring your page state.
 */
export default function LocaleEnhancer() {
  useEffect(() => {
    let aborted = false;

    const pickSelect = (): HTMLSelectElement | null => {
      // Try common selectors in your Templates UI
      const candidates = [
        'select[data-locale-select]',
        'select#locale',
        'select[name="locale"]',
        // Last resort: the first select inside the "New template" form
        'form:has(textarea), form:has([data-editor]) select',
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el && el instanceof HTMLSelectElement) return el;
      }
      // Fallback: first select on the page (least preferred)
      const any = document.querySelector("select");
      return any instanceof HTMLSelectElement ? any : null;
    };

    const enhance = async () => {
      const select = pickSelect();
      if (!select) return;

      const current = select.value;

      try {
        const res = await fetch("/api/locales", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const json = await res.json();

        const locales: Array<{ value: string; label: string; dir?: "ltr" | "rtl" }> =
          Array.isArray(json?.locales) ? json.locales : [];

        if (aborted || !locales.length) return;

        // Clear and rebuild options
        while (select.options.length) select.remove(0);
        for (const { value, label } of locales) {
          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label;
          select.appendChild(opt);
        }

        // Restore selection if possible
        if (current && locales.some(l => l.value === current)) {
          select.value = current;
        } else if (locales.length) {
          select.value = locales[0].value;
        }

        // Notify React/handlers that value may have changed
        select.dispatchEvent(new Event("change", { bubbles: true }));
      } catch {
        // Silent fail — keep existing 4 options
      }
    };

    enhance();
    return () => { aborted = true; };
  }, []);

  return null;
}
