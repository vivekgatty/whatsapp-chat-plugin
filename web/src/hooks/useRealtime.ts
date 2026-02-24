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

export function useRealtime({ table, event = "*", filter, onPayload }: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = getBrowserSupabase();

  const stableCallback = useCallback(onPayload, [onPayload]);

  useEffect(() => {
    const channelName = `realtime-${table}-${event}-${filter ?? "all"}`;

    const channel = supabase.channel(channelName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionOpts: any = {
      event,
      schema: "public",
      table,
    };

    if (filter) {
      subscriptionOpts.filter = filter;
    }

    channel
      .on("postgres_changes", subscriptionOpts, (payload: unknown) => {
        stableCallback(payload as Record<string, unknown>);
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
