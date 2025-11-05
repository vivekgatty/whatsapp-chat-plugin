/* CHATMADI_HEADER_V5 */
"use client";

import Link from "next/link";
import { useEffect } from "react";
import SignOutButton from "./SignOutButton";

/** Is this element a small row of only buttons/links (no real content)? */
function isButtonsOnlyRow(el: HTMLElement) {
  if (!el) return false;
  const kids = Array.from(el.children);
  if (kids.length === 0 || kids.length > 8) return false;
  if (el.querySelector("h1,h2,h3,table,form,article,section,img,textarea,input,select")) return false;
  const len = (el.textContent || "").trim().length;
  if (len > 160) return false;
  for (const k of kids) {
    const t = k.tagName.toLowerCase();
    if (t !== "a" && t !== "button") return false;
  }
  return true;
}

/** Hide duplicate “pills” + “action” rows inside <main> only. */
function hideDashboardDuplicates() {
  const main = document.querySelector("main");
  if (!main) return;

  // 1) Pills row (Overview/Widget/Analytics/Billing) inside content
  const anyPill = main.querySelector<HTMLAnchorElement>(
    'a[href="/dashboard"], a[href="/dashboard/widget"], a[href="/dashboard/analytics"], a[href="/billing"]'
  );
  if (anyPill) {
    const row =
      anyPill.closest<HTMLElement>(".flex, .gap-2, .space-x-2") ||
      (anyPill.parentElement as HTMLElement | null);
    if (row && isButtonsOnlyRow(row)) row.style.display = "none";
  }

  // 2) Action row (Edit profile / Widget settings / Manage plan / Sign out) inside content
  const profileLink = main.querySelector('a[href="/dashboard/profile"]');
  const widgetLink = main.querySelector('a[href="/dashboard/widget"]');
  const billingLink = main.querySelector('a[href="/billing"]');
  if (profileLink && widgetLink && billingLink) {
    const anchor = profileLink; // any of the three works to locate the row
    const row =
      anchor.closest<HTMLElement>(".flex, .gap-2, .space-x-2, .items-center") ||
      (anchor.parentElement as HTMLElement | null);
    if (row && isButtonsOnlyRow(row)) row.style.display = "none";
  }
}

export default function GlobalTopBar() {
  useEffect(() => {
    hideDashboardDuplicates();
    const main = document.querySelector("main");
    if (!main) return;
    const mo = new MutationObserver(hideDashboardDuplicates);
    mo.observe(main, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  return (
    <div data-global-dashboard-topbar>
      <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/widget"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Widget settings
          </Link>

          {/* NEW: Templates pill */}
          <Link
            href="/dashboard/templates"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Templates
          </Link>

          <Link
            href="/dashboard/analytics"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Analytics
          </Link>
          <Link
            href="/billing"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Billing
          </Link>
          <Link
            href="/dashboard/profile"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Edit profile
          </Link>
          <div className="ms-auto">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
