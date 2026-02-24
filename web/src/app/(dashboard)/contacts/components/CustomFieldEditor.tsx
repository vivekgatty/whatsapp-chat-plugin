"use client";

import { useState } from "react";

interface Props {
  contactId: string;
  fields: Record<string, unknown>;
}

export function CustomFieldEditor({ contactId: _contactId, fields }: Props) {
  const [editing, setEditing] = useState(false);
  const entries = Object.entries(fields);

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-gray-900">Custom Fields</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs text-green-600 hover:underline"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      <div className="p-4">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">No custom fields defined</p>
        ) : (
          <div className="space-y-2">
            {entries.map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-500">{key}</span>
                <span className="font-medium text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
