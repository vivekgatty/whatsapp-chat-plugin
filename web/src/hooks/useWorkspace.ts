"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { Workspace, Agent } from "@/types";

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: agentData } = await supabase
      .from("agents")
      .select("*, workspaces(*)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (agentData) {
      setAgent(agentData as unknown as Agent);
      setWorkspace(
        (agentData as unknown as Record<string, unknown>).workspaces as unknown as Workspace
      );
    } else {
      const { data: ownedWorkspace } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (ownedWorkspace) {
        setWorkspace(ownedWorkspace as unknown as Workspace);
      }
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  return { workspace, agent, loading, refresh: load };
}
