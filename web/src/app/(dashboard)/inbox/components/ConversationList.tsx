"use client";

import { useState } from "react";
import { InboxFilters } from "./InboxFilters";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface Props {
  activeId?: string | null;
}

export function ConversationList({ activeId }: Props) {
  const [filter, setFilter] = useState<string>("all");

  // TODO: Fetch conversations with useInbox hook + Supabase Realtime
  const conversations: {
    id: string;
    contactName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    status: string;
  }[] = [];

  return (
    <aside className="flex w-80 flex-col border-r bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
        <InboxFilters value={filter} onChange={setFilter} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <a
              key={c.id}
              href={`/inbox/${c.id}`}
              className={`flex gap-3 border-b px-4 py-3 transition-colors hover:bg-gray-50 ${
                activeId === c.id ? "bg-green-50" : ""
              }`}
            >
              <ContactAvatar name={c.contactName} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-gray-900">
                    {c.contactName}
                  </span>
                  <span className="text-xs text-gray-400">{c.lastMessageAt}</span>
                </div>
                <p className="truncate text-xs text-gray-500">{c.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {c.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                    {c.unreadCount}
                  </span>
                )}
                <StatusBadge status={c.status} />
              </div>
            </a>
          ))
        )}
      </div>
    </aside>
  );
}
