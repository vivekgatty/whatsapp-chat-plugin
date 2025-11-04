/* CHATMADI_HEADER_V4 */
"use client";

import Link from "next/link";
import { useEffect } from "react";
import SignOutButton from "./SignOutButton";

/** tiny utility: does this element have ONLY small <a>/<button> children? */
function isButtonsOnlyRow(el: HTMLElement) {
  const kids = Array.from(el.children);
  if (kids.length === 0 || kids.length > 8) return false;
  // refuse rows that clearly contain content
  if (el.querySelector("h1,h2,h3,table,form,article,section,img,textarea,input,select")) return false;

  for (const k of kids) {
    const t = k.tagName.toLowerCase();
    if (t !== "a" && t !== "button") return false;
  }
  // guard against long text blocks
  const len = (el.textContent || "").trim().length;
  if (len > 140) return false;
  return true;
}

/** Safely hide ONLY the two tiny duplicate rows inside dashboard content. */
function hideDashboardDuplicates() {
  const main = document.querySelector("main");
  if (!main) return;

  // 1) Pills row: Overview / Widget / Analytics / Billing
  const pillAnchor = main.querySelector<HTMLAnchorElement>(
    'a[href="/dashboard"], a[href="/dashboard/widget"], a[href="/dashboard/analytics"], a[href="/billing"]'
  );
  if (pillAnchor) {
    const row =
      pillAnchor.closest<HTMLElement>(".flex, .gap-2, .space-x-2") ||
      (pillAnchor.parentElement as HTMLElement | null);
    if (row && isButtonsOnlyRow(row)) row.style.display = "none";
  }

  // 2) Action row: Edit profile / Widget settings / Manage plan / Sign out
  const actionHit = Array.from(main.querySelectorAll<HTMLElement>("a,button")).find((el) =>
    /Edit profile|Widget settings|Manage plan|Sign out/i.test(el.textContent || "")
  );
  if (actionHit) {
    const row =
      actionHit.closest<HTMLElement>(".flex, .gap-2, .space-x-2, .items-center") ||
      (actionHit.parentElement as HTMLElement | null);
    if (row && isButtonsOnlyRow(row)) row.style.display = "none";
  }
}

export default function GlobalTopBar() {
  // run duplicates hider after first paint (and on DOM changes)
  useEffect(() => {
    hideDashboardDuplicates();
    const main = document.querySelector("main");
    if (!main) return;
    const mo = new MutationObserver(hideDashboardDuplicates);
    mo.observe(main, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  // Always render the header so it shows on /billing and /dashboard without relying on route hydration.
  return (
    <div data-global-dashboard-topbar>
      <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-2">
          <Link href="/dashboard" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">
            Overview
          </Link>
          <Link href="/dashboard/widget" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">
            Widget settings
          </Link>
          <Link href="/dashboard/analytics" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">
            Analytics
          </Link>
          <Link href="/billing" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">
            Billing
          </Link>
          <Link href="/dashboard/profile" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">
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