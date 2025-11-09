"use client";
import { useEffect } from "react";

/**
 * UsageCounter
 * - Client-only enhancer; makes NO layout changes.
 * - Finds the card labeled "Free messages (remaining)" and replaces its value.
 * - Shows a tiny upgrade nudge inside the same card for free/starter.
 * - Degrades gracefully (keeps "N/A") if API is unreachable.
 */
export default function UsageCounter() {
  useEffect(() => {
    let cancelled = false;

    // Helper: safe text setter on the "big number" element inside the card
    const setCardNumber = (el: Element, text: string) => {
      // Prioritize a big number looking element in the same card
      const candidates = Array.from(
        el.closest("div,section,article")?.querySelectorAll("*") ?? []
      ).filter((n) => {
        const t = (n.textContent || "").trim();
        // likely big-number or N/A holder
        return (
          n !== el &&
          (t === "N/A" ||
            /^[0-9]+$/.test(t) ||
            n.className.toString().includes("text-3xl") ||
            n.className.toString().includes("text-4xl") ||
            n.className.toString().includes("font-bold"))
        );
      });

      const target = candidates[0] as HTMLElement | undefined;
      if (target) {
        target.textContent = text;
        return target;
      }
      // Fallback: append a span near the label
      const span = document.createElement("span");
      span.textContent = text;
      span.style.marginLeft = "0.5rem";
      span.style.fontWeight = "700";
      el.parentElement?.appendChild(span);
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
      // Avoid layout shifts: place CTA at the end of the card
      (card as HTMLElement).appendChild(cta);
    };

    // Find the label node for "Free messages (remaining)"
    const findLabel = (): Element | null => {
      const inMain = document.querySelector("main") || document.body;
      const all = Array.from(inMain.querySelectorAll("*"));
      // Look for a node whose text contains the label; prefer short labels (no children)
      const label = all.find((n) => {
        const t = (n.textContent || "").trim().toLowerCase();
        return t.includes("free messages") && t.includes("remaining");
      });
      return (label as Element) || null;
    };

    // Pull usage summary from API (resilient to different shapes)
    const load = async () => {
      try {
        const res = await fetch("/api/usage/summary", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: any = await res.json();

        // Normalize fields
        const plan =
          json?.plan ||
          json?.tier ||
          json?.subscription ||
          json?.current_plan ||
          "starter";

        // Try to read numbers in a few common shapes
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

        const label = findLabel();
        if (!label) return;

        // If we couldn't resolve numbers, at least show 100 for starter/free
        const planLc = String(plan).toLowerCase();
        const isFree = planLc.includes("free") || planLc.includes("starter");
        const value =
          remaining !== null
            ? String(remaining)
            : isFree
            ? String(limit) // default 100
            : String(used); // on pro, show monthly used

        const numEl = setCardNumber(label, value);
        ensureCTA(numEl || label, planLc);
      } catch {
        // Graceful no-op; keep whatever UI exists
        const label = findLabel();
        if (label && !cancelled) {
          // Still attach CTA for free/starter if we can detect via page text
          // (best-effort heuristic; doesn’t alter layout)
          const pageTxt = (document.body.textContent || "").toLowerCase();
          const looksFree =
            pageTxt.includes("plan: starter") || pageTxt.includes("plan: free");
          if (looksFree) ensureCTA(label, "starter");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
