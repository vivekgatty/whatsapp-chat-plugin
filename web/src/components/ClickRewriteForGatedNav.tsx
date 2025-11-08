"use client";
import { useEffect } from "react";

/**
 * If the user is authenticated, intercept clicks on any anchor with a
 * `?next=` href and navigate directly to that decoded path.
 * This avoids landing-page loops and restores access to /dashboard/** and /docs/**
 * without changing header markup.
 */
export default function ClickRewriteForGatedNav() {
  useEffect(() => {
    let authed = false;
    const controller = new AbortController();

    // Probe auth status once; keep it light.
    fetch("/api/auth/status", { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { authed = !!d?.authed; })
      .catch(() => { /* ignore */ });

    const onClick = (evt: MouseEvent) => {
      const el = (evt.target as Element)?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      if (!href.includes("?next=")) return;        // Only touch gated links
      if (!authed) return;                         // Keep gating for signed-out

      try {
        const url = new URL(href, window.location.origin);
        const next = url.searchParams.get("next");
        if (!next) return;

        evt.preventDefault();
        // The next parameter may be encoded; decode safely and go.
        const target = decodeURIComponent(next);
        window.location.assign(target);
      } catch {
        /* ignore malformed hrefs */
      }
    };

    document.addEventListener("click", onClick, true);
    return () => {
      controller.abort();
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
