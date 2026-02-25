"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/contacts", label: "Contacts" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/broadcasts", label: "Broadcasts" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={[
                  "flex min-h-[44px] items-center justify-center px-1 text-[11px]",
                  active ? "text-emerald-400" : "text-slate-300",
                ].join(" ")}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
