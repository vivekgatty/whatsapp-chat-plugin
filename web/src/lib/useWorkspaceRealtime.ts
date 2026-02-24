"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

type Row = Record<string, unknown>;

type DeliveryState = "sent" | "delivered" | "read";

export type WorkspaceRealtimeState = {
  workspaceId: string | null;
  messages: Row[];
  conversations: Row[];
  typingByConversation: Record<string, boolean>;
  unreadCount: number;
  notificationCount: number;
  broadcastProgressPct: number;
  onlineAgents: number;
  messageDelivery: Record<string, DeliveryState>;
};

function getString(r: Row | null | undefined, keys: string[], fallback = ""): string {
  if (!r) return fallback;
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v) return v;
  }
  return fallback;
}

function getNumber(r: Row | null | undefined, keys: string[], fallback = 0): number {
  if (!r) return fallback;
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return fallback;
}

function getBool(r: Row | null | undefined, keys: string[], fallback = false): boolean {
  if (!r) return fallback;
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const s = v.toLowerCase();
      if (["true", "1", "yes", "on"].includes(s)) return true;
      if (["false", "0", "no", "off"].includes(s)) return false;
    }
  }
  return fallback;
}

function resolveDelivery(row: Row): DeliveryState {
  const status = getString(row, ["delivery_status", "status", "message_status"]).toLowerCase();
  if (["read", "seen"].includes(status)) return "read";
  if (["delivered", "received"].includes(status)) return "delivered";
  return "sent";
}

export function useWorkspaceRealtime(workspaceId: string | null): WorkspaceRealtimeState {
  const [messages, setMessages] = useState<Row[]>([]);
  const [conversations, setConversations] = useState<Row[]>([]);
  const [typingByConversation, setTypingByConversation] = useState<Record<string, boolean>>({});
  const [notificationCount, setNotificationCount] = useState(0);
  const [broadcastProgressPct, setBroadcastProgressPct] = useState(0);
  const [onlineAgents, setOnlineAgents] = useState(0);
  const [messageDelivery, setMessageDelivery] = useState<Record<string, DeliveryState>>({});

  useEffect(() => {
    if (!workspaceId) return;

    const supabase = getSupabaseBrowser();
    const channels: RealtimeChannel[] = [];

    const workspaceChannel = supabase
      .channel(`workspace:${workspaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `workspace_id=eq.${workspaceId}` },
        ({ eventType, new: n, old: o }) => {
          const row = (n || o || {}) as Row;
          const messageId = getString(row, ["id"]);

          setMessages((prev) => {
            if (eventType === "DELETE") {
              return prev.filter((m) => getString(m, ["id"]) !== messageId);
            }
            const without = prev.filter((m) => getString(m, ["id"]) !== messageId);
            return [row, ...without].slice(0, 200);
          });

          if (messageId) {
            setMessageDelivery((prev) => ({ ...prev, [messageId]: resolveDelivery(row) }));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations", filter: `workspace_id=eq.${workspaceId}` },
        ({ eventType, new: n, old: o }) => {
          const row = (n || o || {}) as Row;
          const id = getString(row, ["id"]);
          setConversations((prev) => {
            if (eventType === "DELETE") {
              return prev.filter((c) => getString(c, ["id"]) !== id);
            }
            const without = prev.filter((c) => getString(c, ["id"]) !== id);
            return [row, ...without].slice(0, 200);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_events", filter: `workspace_id=eq.${workspaceId}` },
        ({ eventType, new: n, old: o }) => {
          const row = (n || o || {}) as Row;
          const conversationId = getString(row, ["conversation_id"]);
          if (!conversationId) return;
          if (eventType === "DELETE") {
            setTypingByConversation((prev) => ({ ...prev, [conversationId]: false }));
            return;
          }
          const isTyping = getBool(row, ["is_typing"], true);
          setTypingByConversation((prev) => ({ ...prev, [conversationId]: isTyping }));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `workspace_id=eq.${workspaceId}` },
        ({ new: n }) => {
          const row = (n || {}) as Row;
          if (getBool(row, ["is_read", "read"], false)) return;
          setNotificationCount((v) => v + 1);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "broadcast_jobs", filter: `workspace_id=eq.${workspaceId}` },
        ({ new: n }) => {
          const row = (n || {}) as Row;
          const total = getNumber(row, ["total", "total_recipients"], 0);
          const sent = getNumber(row, ["sent", "processed", "delivered"], 0);
          const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((sent / total) * 100))) : 0;
          setBroadcastProgressPct(pct);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_presence", filter: `workspace_id=eq.${workspaceId}` },
        () => {
          // keep cheap, approximate via incremental heartbeat
          setOnlineAgents((v) => Math.max(0, v + 1));
        },
      )
      .subscribe();

    channels.push(workspaceChannel);

    return () => {
      channels.forEach((ch) => {
        supabase.removeChannel(ch);
      });
    };
  }, [workspaceId]);

  const unreadCount = useMemo(
    () => conversations.reduce((acc, c) => acc + getNumber(c, ["unread_count", "unread", "unread_messages"], 0), 0),
    [conversations],
  );

  return {
    workspaceId,
    messages,
    conversations,
    typingByConversation,
    unreadCount,
    notificationCount,
    broadcastProgressPct,
    onlineAgents,
    messageDelivery,
  };
}
