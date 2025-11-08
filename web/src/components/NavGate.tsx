"use client";
import { useEffect } from "react";

/**
 * Client-only gate:
 * - If visiting "/" and NOT authenticated -> hide header/nav (via html[data-hide-header="1"])
 * - If authenticated -> rewrite any header links like "/?next=/dashboard/xyz" to the actual target.
 *   (Prevents landing page content from appearing inside dashboard/docs.)
 */
export default function NavGate() {
  useEffect(() => {
    let authed = false;
    const controller = new AbortController();

    // Helper to toggle header visibility for signed-out home
    const setHideHeader = (hide: boolean) => {
      const html = document.documentElement;
      if (hide) {
        html.setAttribute("data-hide-header", "1");
      } else {
        html.removeAttribute("data-hide-header");
      }
    };

    // Click rewriter (only active when authed)
    const onClick = (evt: MouseEvent) => {
      const el = (evt.target as Element)?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      if (!href.includes("?next=")) return;   // only gated links
      if (!authed) return;                    // keep gating for signed-out users

      try {
        const url = new URL(href, window.location.origin);
        const next = url.searchParams.get("next");
        if (!next) return;

        evt.preventDefault();
        const target = decodeURIComponent(next);
        window.location.assign(target);
      } catch {
        // ignore malformed hrefs
      }
    };

    // Attach early so it works as soon as auth state is known
    document.addEventListener("click", onClick, true);

    // Probe auth state (lightweight, cookie-based)
    (async () => {
      try {
        const res = await fetch("/api/auth/status", { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        authed = !!data?.authed;
      } catch {
        authed = false;
      }

      // Hide header ONLY on "/" when not authed
      const atHome = location.pathname === "/" || location.pathname === "";
      setHideHeader(atHome && !authed);
    })();

    // Cleanup
    return () => {
      controller.abort();
      document.removeEventListener("click", onClick, true);
      setHideHeader(false);
    };
  }, []);

  return null;
}
