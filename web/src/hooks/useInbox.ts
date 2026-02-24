"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { Conversation, Message } from "@/types";

interface UseInboxOptions {
  conversationId?: string | null;
  filter?: string;
}

export function useInbox({ conversationId, filter }: UseInboxOptions = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getBrowserSupabase();

  const loadConversations = useCallback(async () => {
    let query = supabase
      .from("conversations")
      .select("*, contacts(name, profile_name, wa_id, avatar_url)")
      .order("last_message_at", { ascending: false })
      .limit(50);

    if (filter && filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setConversations((data as unknown as Conversation[]) ?? []);
    setLoading(false);
  }, [supabase, filter]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);

    setMessages((data as unknown as Message[]) ?? []);
  }, [supabase, conversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const channel = supabase
      .channel("inbox-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        loadConversations();
        if (conversationId) loadMessages();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, loadConversations, loadMessages]);

  return { conversations, messages, loading, refresh: loadConversations };
}
