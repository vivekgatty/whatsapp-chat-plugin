"use client";

import { ContactAvatar } from "@/components/shared/ContactAvatar";

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-green-600 md:hidden">ChatMadi</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          title="Notifications"
          className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          🔔
        </button>
        <ContactAvatar name="Me" size="sm" />
      </div>
    </header>
  );
}
