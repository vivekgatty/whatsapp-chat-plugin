"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/**
 * On first load after login:
 * - if ?wid is missing, try cookie(cm_widget_id)
 * - if cookie is missing, get email from Supabase, POST to /api/resolve-widget
 *   (server sets cm_widget_id), then push ?wid=<id>
 * Does nothing if wid already present.
 */
export default function ResolveWidgetClient() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      try {
        // If URL already has wid, nothing to do
        const widInUrl = params.get("wid");
        if (widInUrl) return;

        // Try cookie first
        const cookieWid = readCookie("cm_widget_id");
        if (cookieWid) {
          replaceWithWid(cookieWid);
          return;
        }

        // Otherwise, get user email from Supabase browser client
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(url, anon);
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email?.toLowerCase().trim();

        if (!email) return; // not signed in yet

        // Ask server to resolve/create widget + set cookie
        const resp = await fetch("/api/resolve-widget", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        }).then(r => r.json()).catch(() => null);

        const serverWid = resp?.widgetId || cookieWid;
        if (serverWid) {
          replaceWithWid(serverWid);
        }
      } catch {
        // fail silently; page will fall back to old behavior
      }
    })();

    function readCookie(name: string) {
      if (typeof document === "undefined") return "";
      const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return m ? decodeURIComponent(m[2]) : "";
    }

    function replaceWithWid(id: string) {
      // Add wid to the current URL without full page reload
      const u = new URL(window.location.href);
      if (u.searchParams.get("wid") !== id) {
        u.searchParams.set("wid", id);
        router.replace(u.pathname + "?" + u.searchParams.toString());
      }
    }
  }, [params, router]);

  return null;
}