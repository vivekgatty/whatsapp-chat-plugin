import Link from "next/link";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      {/* Toolbar (top-right) */}
      <div className="flex items-center justify-end gap-2 mb-3">
        <Link
          href="/dashboard/analytics/triggers"
          prefetch
          id="btn-trigger-events"
          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black text-sm"
        >
          Trigger events
        </Link>
      </div>

      {children}

      {/* Floating fallback (always visible) */}
      <Link
        href="/dashboard/analytics/triggers"
        prefetch
        className="hidden md:inline-flex fixed z-50 bottom-6 right-6 px-4 py-2 rounded-full shadow-lg bg-amber-500 hover:bg-amber-600 text-black font-medium"
      >
        Trigger events
      </Link>
    </div>
  );
}