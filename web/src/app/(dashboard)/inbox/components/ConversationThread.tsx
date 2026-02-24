"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Message } from "@/types";

interface ConvoInfo {
  id: string;
  status: string;
  customer_window_expires_at: string | null;
  assigned_agent_id: string | null;
  labels: string[];
  contacts: {
    name: string | null;
    profile_name: string | null;
    wa_id: string;
    phone: string | null;
  } | null;
}

interface Props {
  conversationId: string | null;
  onBack?: () => void;
  onShowContact?: () => void;
}

function windowTimeLeft(expiresAt: string | null): {
  label: string;
  color: string;
} {
  if (!expiresAt) return { label: "Window closed", color: "text-red-500" };
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 0) return { label: "Window closed", color: "text-red-500" };
  const hours = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  if (hours < 1) return { label: `${mins}m remaining`, color: "text-red-500" };
  if (hours < 3) return { label: `${hours}h ${mins}m remaining`, color: "text-amber-500" };
  return { label: `${hours}h remaining`, color: "text-green-600" };
}

export function ConversationThread({ conversationId, onBack, onShowContact }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [convo, setConvo] = useState<ConvoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const supabase = getBrowserSupabase();

  const loadConvo = useCallback(async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("conversations")
      .select(
        "id, status, customer_window_expires_at, assigned_agent_id, labels, contacts(name, profile_name, wa_id, phone)"
      )
      .eq("id", conversationId)
      .single();
    setConvo(data as unknown as ConvoInfo);
  }, [supabase, conversationId]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data as unknown as Message[]) ?? []);
    setLoading(false);
  }, [supabase, conversationId]);

  useEffect(() => {
    loadConvo();
    loadMessages();
  }, [loadConvo, loadMessages]);

  // Scroll to bottom on new messages (only if user is at bottom)
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }

  // Realtime messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`thread-${conversationId}`)
      .on(
        "postgres_changes" as "system",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        () => loadMessages()
      )
      .on(
        "postgres_changes" as "system",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        () => loadMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, loadMessages]);

  if (!conversationId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <EmptyState
          title="Select a conversation"
          description="Choose a conversation from the left to start messaging."
        />
      </div>
    );
  }

  const contactName =
    convo?.contacts?.name ?? convo?.contacts?.profile_name ?? convo?.contacts?.wa_id ?? "…";
  const window = windowTimeLeft(convo?.customer_window_expires_at ?? null);
  const windowOpen = convo?.customer_window_expires_at
    ? new Date(convo.customer_window_expires_at).getTime() > Date.now()
    : false;

  // Group messages by date
  let lastDate = "";
  const messagesWithSeparators: (Message | { type: "date"; date: string })[] = [];
  for (const msg of messages) {
    const d = new Date(msg.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (d !== lastDate) {
      messagesWithSeparators.push({ type: "date", date: d });
      lastDate = d;
    }
    messagesWithSeparators.push(msg);
  }

  return (
    <div className="flex flex-1 flex-col border-r">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 md:hidden">
            ←
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{contactName}</h3>
              {convo?.status && <StatusBadge status={convo.status} />}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">{convo?.contacts?.phone}</span>
              <span className={window.color}>{window.label}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {convo?.labels?.map((l) => (
            <span key={l} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {l}
            </span>
          ))}
          <button
            onClick={onShowContact}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            title="Contact details"
          >
            👤
          </button>
          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="More options"
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#e5ddd5] p-4"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-2">
            {messagesWithSeparators.map((item, i) =>
              "type" in item && item.type === "date" ? (
                <div key={`date-${i}`} className="flex justify-center py-2">
                  <span className="rounded-lg bg-white/80 px-3 py-1 text-xs text-gray-500 shadow-sm">
                    {item.date}
                  </span>
                </div>
              ) : (
                <MessageBubble key={(item as Message).id} message={item as Message} />
              )
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer or window-closed notice */}
      {windowOpen ? (
        <MessageComposer conversationId={conversationId} />
      ) : (
        <div className="border-t bg-amber-50 p-4 text-center">
          <p className="text-sm text-amber-700">
            Customer window closed. You can only send template messages.
          </p>
          <button className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Send Template
          </button>
        </div>
      )}
    </div>
  );
}
