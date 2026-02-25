"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * UsageCounter
 * - Keeps the free-messages countdown + CTA (unchanged)
 * - NEW: Maps signed-in user -> unique widget via /api/me/widget-id
 *         and rewrites the "Widget ID" card on the Overview page.
 */
export default function UsageCounter() {
  useEffect(() => {
    let cancelled = false;

    // Helper: safe text setter on the "big number" element inside a stat card
    const setCardNumber = (el: Element, text: string) => {
      const host = el.closest("div,section,article") || el;
      const candidates = Array.from(
        host.querySelectorAll<HTMLElement>("*")
      ).filter((n) => {
        const t = (n.textContent || "").trim();
        return (
          n !== el &&
          (t === "N/A" ||
            /^[0-9A-Za-z-]+$/.test(t) ||
            n.className.toString().includes("text-3xl") ||
            n.className.toString().includes("text-4xl") ||
            n.className.toString().includes("font-semibold") ||
            n.className.toString().includes("font-bold"))
        );
      });

      const target = candidates[0];
      if (target) {
        target.textContent = text;
        return target;
      }
      const span = document.createElement("span");
      span.textContent = text;
      span.style.marginLeft = "0.5rem";
      span.style.fontWeight = "700";
      (el.parentElement || host).appendChild(span);
      return span;
    };

    // Helper: add tiny CTA once per page
    const ensureCTA = (host: Element, plan: string) => {
      const card = host.closest("div,section,article") || host;
      if (!card || plan.toLowerCase() === "pro") return;
      const markerAttr = "data-usage-cta";
      if ((card as HTMLElement).querySelector(`[${markerAttr}]`)) return;

      const cta = document.createElement("a");
      cta.setAttribute(markerAttr, "1");
      cta.href = "/dashboard/billing";
      cta.textContent = "Upgrade to unlimited at ₹199/mo →";
      cta.className =
        "text-xs underline hover:opacity-80 block mt-1 text-emerald-400";
      (card as HTMLElement).appendChild(cta);
    };

    // Generic label finder
    const findLabelByText = (needleLower: string): Element | null => {
      const root = document.querySelector("main") || document.body;
      const all = Array.from(root.querySelectorAll("*"));
      const node = all.find((n) =>
        (n.textContent || "").toLowerCase().includes(needleLower)
      );
      return (node as Element) || null;
    };

    // -------------------------
    //  A) FREE-MESSAGES COUNTER
    // -------------------------
    const loadFreeMessages = async () => {
      try {
        const res = await fetch("/api/usage/summary", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: any = await res.json();

        const plan =
          json?.plan ||
          json?.tier ||
          json?.subscription ||
          json?.current_plan ||
          "starter";

        const limit =
          Number(json?.limit ?? json?.quota ?? json?.free_quota ?? 100) || 100;

        const used =
          Number(json?.used ?? json?.usage ?? json?.month_used ?? 0) || 0;

        const remainingRaw =
          json?.remaining ??
          (typeof limit === "number" && typeof used === "number"
            ? Math.max(0, limit - used)
            : null);

        const remaining =
          remainingRaw === null || Number.isNaN(Number(remainingRaw))
            ? null
            : Number(remainingRaw);

        if (cancelled) return;

        const label = findLabelByText("free messages");
        if (!label) return;

        const planLc = String(plan).toLowerCase();
        const isFree = planLc.includes("free") || planLc.includes("starter");
        const value =
          remaining !== null
            ? `${remaining} / ${limit || "—"}`
            : isFree
            ? `${limit} / ${limit || "—"}`
            : String(used);

        const numEl = setCardNumber(label, value);
        ensureCTA(numEl || label, planLc);
      } catch {
        // Best-effort CTA for starter/free
        const label = findLabelByText("free messages");
        if (label && !cancelled) {
          const pageTxt = (document.body.textContent || "").toLowerCase();
          const looksFree =
            pageTxt.includes("plan: starter") || pageTxt.includes("plan: free");
          if (looksFree) ensureCTA(label, "starter");
        }
      }
    };

    // ---------------------------------------
    //  B) UNIQUE WIDGET PER USER (NEW LOGIC)
    // ---------------------------------------
    const mapAndRewriteWidgetId = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) return;

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) return; // not signed in

        // Tell the API who we are; it will create/map a per-user widget id.
        const resp = await fetch("/api/me/widget-id", {
          headers: { "x-user-id": user.id },
          cache: "no-store",
        });
        if (!resp.ok) return;
        const payload: any = await resp.json();
        const widgetId = String(payload?.widgetId || "");

        if (!widgetId) return;
        if (cancelled) return;

        // Rewrite the "Widget ID" card in place (no layout change)
        const label = findLabelByText("widget id");
        if (label) setCardNumber(label, widgetId);

        // Optional convenience for copy/snippet UIs
        (window as any).chatmadiWidgetId = widgetId;
        try {
          localStorage.setItem("chatmadi.widgetId", widgetId);
        } catch {}
      } catch {
        // silent
      }
    };

    loadFreeMessages();
    mapAndRewriteWidgetId();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
