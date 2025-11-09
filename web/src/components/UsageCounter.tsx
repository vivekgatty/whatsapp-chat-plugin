"use client";

import { useEffect } from "react";

/**
 * UsageCounter
 * - Fetches /api/usage/summary
 * - Finds the "Free messages (remaining)" card on the Overview page
 * - Replaces "N/A" with the correct number
 *   - Free/Starter: remaining out of 100 + tiny upgrade link
 *   - Pro: shows messages used this month (just the number)
 *
 * IMPORTANT: Renders nothing and does not change layout.
 */
export default function UsageCounter() {
  useEffect(() => {
    let cancelled = false;

    const apply = (data: {
      plan?: string;
      free_quota: number | null;
      remaining: number | null;
      used: number;
    }) => {
      if (cancelled) return;

      // 1) Locate the "Free messages (remaining)" label on the page
      const all = Array.from(document.querySelectorAll<HTMLElement>("*"));
      const label = all.find((el) =>
        /free messages\s*\(remaining\)/i.test(el.textContent || "")
      );
      if (!label) return;

      // 2) Work within the nearest card-like container (keep it resilient)
      const card =
        (label.closest("section,article,div") as HTMLElement) || label.parentElement || label;

      // 3) Prefer to replace the specific "N/A" value within the card
      const valueEl =
        Array.from(card.querySelectorAll<HTMLElement>("*")).find(
          (el) => (el.childElementCount === 0) && (el.textContent || "").trim().toUpperCase() === "N/A"
        ) || null;

      // 4) Compute what to show
      const isFree = data.free_quota !== null && data.free_quota !== undefined;
      const numberText = isFree
        ? String(Math.max((data.remaining ?? 0), 0))
        : String(data.used ?? 0); // Pro: show used

      // 5) Update the number (fallback: append near the label if we can’t find "N/A")
      const placeTarget = (valueEl || label) as HTMLElement;
      try {
        if (valueEl) {
          valueEl.textContent = numberText;
        } else {
          // Minimal, non-invasive: append the number near the label
          const span = document.createElement("span");
          span.style.marginLeft = "0.5rem";
          span.textContent = numberText;
          label.appendChild(span);
        }

        // 6) On Free plan, append a tiny upgrade hint (no layout change)
        if (isFree) {
          // Avoid duplicates
          if (!card.querySelector("[data-upgrade-hint]")) {
            const hint = document.createElement("a");
            hint.setAttribute("data-upgrade-hint", "1");
            hint.href = "/dashboard/billing";
            hint.textContent = "Upgrade to unlimited for ₹199";
            hint.style.display = "block";
            hint.style.fontSize = "12px";
            hint.style.marginTop = "4px";
            hint.style.opacity = "0.9";
            hint.style.textDecoration = "underline";
            hint.style.width = "fit-content";
            // Choose a readable link color without touching your theme tokens
            hint.style.color = "rgb(94, 234, 212)"; // teal-ish, subtle

            // Anchor it right under the value if possible, else under the label
            const anchorParent =
              (valueEl && valueEl.parentElement) || label.parentElement || card;
            anchorParent?.appendChild(hint);
          }
        }
      } catch {
        // Best-effort only; never crash the page
      }
    };

    const run = async () => {
      try {
        const res = await fetch("/api/usage/summary", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) apply(json);
      } catch {
        /* ignore network errors */
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
