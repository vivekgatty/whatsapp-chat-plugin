"use client";
import { useEffect } from "react";

export default function RewriteNavWhenAuthed() {
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/auth/status", { cache: "no-store" });
        const json = await res.json();
        if (!json?.authed) return;

        document.querySelectorAll<HTMLAnchorElement>('a[href^="/?next="]').forEach((a) => {
          try {
            const url = new URL(a.getAttribute("href")!, window.location.origin);
            const next = url.searchParams.get("next");
            if (!next) return;
            const dec = decodeURIComponent(next);
            if (dec.startsWith("/")) a.setAttribute("href", dec);
          } catch { /* ignore */ }
        });
      } catch { /* ignore */ }
    };
    run();
  }, []);
  return null;
}
