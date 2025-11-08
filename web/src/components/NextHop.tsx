"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

/** Runs only on / (landing).
 * If URL is /?next=... and user is signed in, forward to that internal route.
 * Keeps content untouched; just fixes the stuck-on-landing issue.
 */
export default function NextHop() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      if (!next) return;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );

      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          let target = "/dashboard/overview";
          try {
            const dec = decodeURIComponent(next);
            if (dec.startsWith("/")) target = dec;
          } catch {}
          // use location.replace to avoid back button returning to /?next=...
          window.location.replace(target);
        }
      });
    } catch {
      /* no-op */
    }
  }, []);

  return null;
}
