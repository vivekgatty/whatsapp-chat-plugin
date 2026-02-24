"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { InboxFilters } from "./InboxFilters";
import { ContactAvatar } from "@/components/shared/ContactAvatar";

interface ConversationRow {
  id: string;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  assigned_agent_id: string | null;
  labels: string[];
  contact_id: string;
  contacts: {
    name: string | null;
    profile_name: string | null;
    wa_id: string;
    avatar_url: string | null;
  } | null;
}

interface Props {
  activeId?: string | null;
  onSelect?: (conversationId: string, contactId: string) => void;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function ConversationList({ activeId, onSelect }: Props) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    let query = supabase
      .from("conversations")
      .select(
        "id, status, last_message_at, last_message_preview, unread_count, assigned_agent_id, labels, contact_id, contacts(name, profile_name, wa_id, avatar_url)",
      )
      .order("last_message_at", { ascending: false })
      .limit(50);

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setConversations((data as unknown as ConversationRow[]) ?? []);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: new messages push conversations to top
  useEffect(() => {
    const channel = supabase
      .channel("inbox-list")
      .on(
        "postgres_changes" as "system",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { event: "UPDATE", schema: "public", table: "conversations" } as any,
        () => load(),
      )
      .on(
        "postgres_changes" as "system",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { event: "INSERT", schema: "public", table: "conversations" } as any,
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, load]);

  const filtered = search
    ? conversations.filter((c) => {
        const name =
          c.contacts?.name ?? c.contacts?.profile_name ?? c.contacts?.wa_id ?? "";
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          (c.last_message_preview ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      })
    : conversations;

  return (
    <aside className="flex h-full flex-col border-r bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
        <input
          type="text"
          placeholder="Search conversations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <InboxFilters value={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No conversations</p>
            <p className="mt-1 text-xs text-gray-400">
              {filter !== "all"
                ? "Try a different filter"
                : "Messages from customers appear here automatically"}
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const name =
              c.contacts?.name ??
              c.contacts?.profile_name ??
              c.contacts?.wa_id ??
              "Unknown";
            const isActive = activeId === c.id;

            return (
              <button
                key={c.id}
                onClick={() => onSelect?.(c.id, c.contact_id)}
                className={`flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  isActive ? "border-l-2 border-l-green-500 bg-green-50" : ""
                }`}
              >
                <ContactAvatar
                  name={name}
                  imageUrl={c.contacts?.avatar_url}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`truncate text-sm ${c.unread_count > 0 ? "font-semibold text-gray-900" : "text-gray-700"}`}
                    >
                      {name}
                    </span>
                    <span className="ml-2 flex-shrink-0 text-xs text-gray-400">
                      {relativeTime(c.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs text-gray-500">
                      {c.last_message_preview?.slice(0, 60) ?? "No messages"}
                    </p>
                    <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                      {c.labels?.slice(0, 2).map((l) => (
                        <span
                          key={l}
                          className="h-2 w-2 rounded-full bg-green-400"
                        />
                      ))}
                      {c.unread_count > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-500 px-1 text-xs font-medium text-white">
                          {c.unread_count > 99 ? "99+" : c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
