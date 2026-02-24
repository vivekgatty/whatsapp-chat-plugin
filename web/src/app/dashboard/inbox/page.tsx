"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Conversation = { id: string; title?: string; contact_name?: string; updated_at?: string };
type Msg = { id: string; body?: string; message?: string; created_at?: string; direction?: string };

export default function InboxMobilePage() {
  const [businessId, setBusinessId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [composer, setComposer] = useState("");
  const [offset, setOffset] = useState(0);
  const [kbOffset, setKbOffset] = useState(0);

  useEffect(() => {
    fetch("/api/business/overview", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const id = String(j?.business?.id || j?.business?.business_id || "");
        if (id) setBusinessId(id);
      })
      .catch(() => {});
  }, []);

  const loadConversations = useCallback((nextOffset = 0) => {
    if (!businessId) return;
    fetch(`/api/inbox/conversations?business_id=${encodeURIComponent(businessId)}&limit=20&offset=${nextOffset}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const rows = (j?.items || []) as Conversation[];
        setConversations((prev) => (nextOffset === 0 ? rows : [...prev, ...rows]));
      })
      .catch(() => {});
  }, [businessId]);

  useEffect(() => {
    loadConversations(0);
  }, [loadConversations]);

  useEffect(() => {
    if (!businessId || !selected?.id) return;
    fetch(`/api/inbox/messages?business_id=${encodeURIComponent(businessId)}&conversation_id=${encodeURIComponent(selected.id)}&limit=20`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setMessages((j?.items || []) as Msg[]))
      .catch(() => setMessages([]));
  }, [businessId, selected?.id]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const heightDiff = Math.max(0, window.innerHeight - vv.height);
      setKbOffset(heightDiff);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const listView = !selected;

  const title = useMemo(() => selected?.contact_name || selected?.title || "Conversation", [selected]);

  return (
    <section className="mx-auto max-w-3xl">
      {listView ? (
        <div>
          <h1 className="mb-3 text-lg font-semibold">Inbox</h1>
          <div className="space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c)}
                className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 text-left"
              >
                <span className="truncate">{c.contact_name || c.title || c.id}</span>
                <span className="text-xs text-slate-400">›</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                const n = offset + 20;
                setOffset(n);
                loadConversations(n);
              }}
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm"
            >
              Load more
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-30 flex flex-col bg-slate-950 md:static md:z-auto md:bg-transparent">
          <header className="sticky top-0 z-10 flex min-h-[44px] items-center gap-2 border-b border-slate-800 bg-slate-950 px-3">
            <button type="button" onClick={() => setSelected(null)} className="min-h-[44px] min-w-[44px] rounded-md border border-slate-700">←</button>
            <h2 className="truncate text-sm font-medium">{title}</h2>
          </header>

          <div className="flex-1 space-y-2 overflow-y-auto p-3 pb-32">
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-sm">
                <div>{m.body || m.message || "(empty)"}</div>
                <div className="mt-1 text-[11px] text-slate-400">{m.created_at || ""}</div>
              </div>
            ))}
          </div>

          <div className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950 p-2" style={{ bottom: `${kbOffset}px`, paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}>
            <div className="flex items-end gap-2">
              <textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Type a message"
                className="min-h-[44px] flex-1 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"
              />
              <button type="button" className="min-h-[44px] rounded-lg bg-emerald-600 px-4 text-sm font-medium">Send</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
