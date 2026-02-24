"use client";

import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: "🏠" },
  { href: "/inbox", label: "Inbox", icon: "💬" },
  { href: "/contacts", label: "Contacts", icon: "👥" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/broadcasts", label: "Broadcasts", icon: "📢" },
  { href: "/automations", label: "Automations", icon: "⚡" },
  { href: "/templates", label: "Templates", icon: "📋" },
  { href: "/catalog", label: "Catalog", icon: "🛍️" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/help", label: "Help", icon: "❓" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col border-r bg-white md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold text-green-600">ChatMadi</span>
      </div>
      <nav className="flex flex-1 flex-col justify-between p-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-green-50 font-medium text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="space-y-0.5 border-t pt-2">
          {BOTTOM_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
