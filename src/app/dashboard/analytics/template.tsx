import Link from "next/link";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-2 mb-3">
        <Link
          prefetch
          href="/dashboard/analytics/triggers"
          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black text-sm"
          id="btn-trigger-events"
        >
          Trigger events
        </Link>
      </div>
      {children}
    </div>
  );
}