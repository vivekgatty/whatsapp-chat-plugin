"use client";
import { useEffect } from "react";

/** Runs only on / (landing).
 * If URL is /?next=... and user is signed in (cookie-based), forward immediately.
 */
export default function NextHop() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextRaw = params.get("next");
    if (!nextRaw) return;

    const forward = async () => {
      try {
        const res = await fetch("/api/auth/status", { cache: "no-store" });
        const json = await res.json();
        if (!json?.authed) return;

        let target = "/dashboard/overview";
        try {
          const dec = decodeURIComponent(nextRaw);
          if (dec.startsWith("/")) target = dec;
        } catch {}
        window.location.replace(target);
      } catch {
        /* ignore */
      }
    };
    forward();
  }, []);

  return null;
}
