"use client";

import { useEffect, useRef, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onPayload: (payload: Record<string, unknown>) => void;
}

/**
 * Subscribe to Supabase Realtime postgres_changes.
 * Automatically cleans up on unmount.
 */
export function useRealtime({ table, event = "*", filter, onPayload }: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = getBrowserSupabase();

  const stableCallback = useCallback(onPayload, [onPayload]);

  useEffect(() => {
    const channelName = `realtime-${table}-${event}-${filter ?? "all"}`;

    const opts: {
      event: typeof event;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema: "public",
      table,
    };

    if (filter) {
      opts.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", opts, (payload) => {
        stableCallback(payload as unknown as Record<string, unknown>);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, table, event, filter, stableCallback]);
}
