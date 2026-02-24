"use client";

import type { Conversation } from "@/types";

interface Props {
  contactId: string;
}

export function ContactTimeline({ contactId: _contactId }: Props) {
  // TODO: Fetch conversation history for this contact
  const conversations: Conversation[] = [];

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
      </div>
      <div className="p-4">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => (
              <a
                key={c.id}
                href={`/inbox/${c.id}`}
                className="block rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {c.source === "inbound" ? "Inbound" : "Outbound"} conversation
                  </span>
                  <span className="text-xs text-gray-400">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-gray-500">{c.last_message_preview}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
