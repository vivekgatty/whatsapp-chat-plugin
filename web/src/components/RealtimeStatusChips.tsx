"use client";

import React, { useEffect, useState } from "react";
import { useWorkspaceRealtime } from "@/lib/useWorkspaceRealtime";

export default function RealtimeStatusChips() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/usage/summary", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        const id = String(j?.widgetId || "").trim();
        if (id) setWorkspaceId(id);
      })
      .catch(() => {
        if (active) setWorkspaceId(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const rt = useWorkspaceRealtime(workspaceId);

  const liveTyping = Object.values(rt.typingByConversation).some(Boolean);

  return (
    <div className="ml-2 flex items-center gap-2 text-[11px]">
      <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
        Unread: <b>{rt.unreadCount}</b>
      </span>
      <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
        🔔 <b>{rt.notificationCount}</b>
      </span>
      <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
        Broadcast: <b>{rt.broadcastProgressPct}%</b>
      </span>
      <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
        Agents: <b>{rt.onlineAgents}</b>
      </span>
      <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
        Typing: <b>{liveTyping ? "yes" : "no"}</b>
      </span>
      <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
        Msg updates: <b>{Object.keys(rt.messageDelivery).length}</b>
      </span>
    </div>
  );
}
