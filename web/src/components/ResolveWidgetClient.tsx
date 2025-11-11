"use client";
import { useEffect } from "react";

/**
 * ResolveWidgetClient
 * - Client helper that finds the logged-in email (from Supabase localStorage/cookies/DOM),
 *   POSTs to /api/resolve-widget, lets the server set `cm_widget_id`, and appends ?wid=...
 * - Best-effort only. No visual UI and won’t break anything if it can’t find an email.
 */
export default function ResolveWidgetClient() {
  useEffect(() => {
    let cancelled = false;

    const emailFromSupabaseLocalStorage = (): string | null => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || "";
          if (!/auth-token/i.test(k)) continue;
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          // supabase stores JSON session in localStorage
          const j = JSON.parse(raw);
          const e =
            j?.user?.email ||
            j?.currentSession?.user?.email ||
            j?.currentSession?.user?.user_metadata?.email ||
            j?.user?.user_metadata?.email;
          if (e) return String(e).toLowerCase();
        }
      } catch {}
      return null;
    };

    const emailFromCookies = (): string | null => {
      try {
        const m = document.cookie.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        return m ? m[0].toLowerCase() : null;
      } catch {}
      return null;
    };

    const emailFromDOM = (): string | null => {
      try {
        const main = document.querySelector("main") || document.body;
        const txt = (main?.textContent || "");
        const m = txt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        return m ? m[0].toLowerCase() : null;
      } catch {}
      return null;
    };

    const setWidgetIdText = (wid: string) => {
      try {
        const main = document.querySelector("main") || document.body;
        if (!main) return;
        const all = Array.from(main.querySelectorAll("*"));
        // Find an element whose text is exactly "Widget ID"
        const label = all.find(n => (n.textContent || "").trim().toLowerCase() === "widget id");
        if (!label) return;
        const card = label.closest("div,section,article") || label.parentElement || main;
        const valueEl = Array.from(card.querySelectorAll("span,div,code"))
          .find(x => x !== label && (x.textContent || "").length >= 8);
        if (valueEl) (valueEl as HTMLElement).textContent = wid;
      } catch {}
    };

    const appendWidParam = (wid: string) => {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("wid") !== wid) {
          url.searchParams.set("wid", wid);
          window.history.replaceState({}, "", url.toString());
        }
      } catch {}
    };

    const run = async () => {
      const email =
        emailFromSupabaseLocalStorage() ||
        emailFromCookies() ||
        emailFromDOM();

      if (!email) return; // nothing to do, fail-safe

      try {
        const res = await fetch("/api/resolve-widget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const wid = String(json?.widgetId || "");
        if (!wid || cancelled) return;
        // Update the UI hint and URL param
        setWidgetIdText(wid);
        appendWidParam(wid);
      } catch {}
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return null;
}
/* cm-build-stamp: 2025-11-11T09:05:01.880+05:30 */
