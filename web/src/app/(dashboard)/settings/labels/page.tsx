"use client";

import type { Label } from "@/types";

export default function LabelsSettingsPage() {
  // TODO: Fetch labels
  const labels: Label[] = [];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Labels</h1>
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Add Label
        </button>
      </div>

      {labels.length === 0 ? (
        <p className="text-sm text-gray-500">
          No labels defined. Create labels to categorize conversations.
        </p>
      ) : (
        <div className="space-y-2">
          {labels.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-lg border bg-white p-3">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="flex-1 font-medium text-gray-900">{l.name}</span>
              <span className="text-xs text-gray-400">{l.times_used} uses</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
