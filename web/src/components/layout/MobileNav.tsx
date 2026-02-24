"use client";

import { usePathname } from "next/navigation";

const MOBILE_NAV = [
  { href: "/inbox", label: "Inbox", icon: "💬" },
  { href: "/contacts", label: "Contacts", icon: "👥" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/overview", label: "Home", icon: "🏠" },
  { href: "/settings", label: "More", icon: "⚙️" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex border-t bg-white md:hidden">
      {MOBILE_NAV.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
