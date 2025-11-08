"use client";

/**
 * NavGate renders nothing. It:
 * 1) Hides the global header on the landing page ("/") so first-time visitors never see it.
 * 2) If the user is authenticated, intercepts anchors with "?next=" and navigates
 *    directly to that decoded path (so you don’t bounce through the landing page).
 */
export default function NavGate() {
  // Hide header on "/" immediately (no flash)
  if (typeof document !== "undefined") {
    try {
      const path = location.pathname || "/";
      if (path === "/") {
        // Mark <html> so CSS can hide any global <header>/<nav> in your layout.
        document.documentElement.setAttribute("data-hide-header", "1");
      } else {
        document.documentElement.removeAttribute("data-hide-header");
      }
    } catch {}
  }

  // Lightweight auth probe + click rewriter
  if (typeof window !== "undefined") {
    let authed = false;
    const controller = new AbortController();

    fetch("/api/auth/status", { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { authed = !!d?.authed; })
      .catch(() => { /* ignore */ });

    const onClick = (evt: MouseEvent) => {
      const el = (evt.target as Element)?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      if (!href.includes("?next=")) return;    // only touch gated links
      if (!authed) return;                     // still signed-out → let landing page gate

      try {
        const url = new URL(href, window.location.origin);
        const next = url.searchParams.get("next");
        if (!next) return;
        evt.preventDefault();
        window.location.assign(decodeURIComponent(next));
      } catch {
        /* ignore malformed hrefs */
      }
    };

    document.addEventListener("click", onClick, true);

    // Cleanup on hot-reload/navigation
    return () => {
      controller.abort();
      document.removeEventListener("click", onClick, true);
    };
  }

  return null;
}
