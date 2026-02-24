"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import RealtimeStatusChips from "@/components/RealtimeStatusChips";

const links = [
  { href: "/dashboard/overview", label: "Overview" },
  { href: "/dashboard/widgetsettings", label: "Widget settings" },
  { href: "/dashboard/templates", label: "Templates" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/docs", label: "Docs" },
  { href: "/dashboard/editprofile", label: "Edit profile" },
];

export default function GlobalTopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2">
        {/* App name slot (kept minimal) */}
        <div className="mr-2 text-sm font-semibold text-slate-200">ChatMadi</div>

        <nav className="flex flex-1 flex-wrap items-center gap-2">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (pathname?.startsWith(l.href) && l.href !== "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "rounded-md border px-3 py-1.5 text-xs",
                  active
                    ? "border-slate-700 bg-slate-800 text-slate-100"
                    : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <RealtimeStatusChips />
      </div>
    </header>
  );
}
