"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import SignOutButton from "./SignOutButton";

function HideLegacyDashboardActions() {
  useEffect(() => {
    try {
      const rows = Array.from(document.querySelectorAll("div"));
      for (const row of rows) {
        const hasWidget = row.querySelector('a[href="/dashboard/widget"]');
        const hasBilling = row.querySelector('a[href="/billing"]');
        if (hasWidget && hasBilling) {
          if (!row.closest('[data-global-dashboard-topbar]')) {
            (row as HTMLElement).style.display = "none";
            break;
          }
        }
      }
    } catch {}
  }, []);
  return null;
}

export default function GlobalTopBar() {
  const pathname = usePathname();
  if (!pathname?.startsWith("/dashboard")) return null;

  return (
    <div data-global-dashboard-topbar>
      <HideLegacyDashboardActions />
      <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-2">
          <Link href="/dashboard" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">Overview</Link>
          <Link href="/dashboard/widget" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">Widget settings</Link>
          <Link href="/dashboard/analytics" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">Analytics</Link>
          <Link href="/billing" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">Billing</Link>
          <Link href="/dashboard/profile" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">Edit profile</Link>
          <div className="ms-auto">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}