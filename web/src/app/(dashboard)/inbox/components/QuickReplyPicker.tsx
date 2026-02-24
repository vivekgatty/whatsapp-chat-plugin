"use client";

import type { QuickReply } from "@/types";

interface Props {
  query: string;
  onSelect: (content: string) => void;
  onClose: () => void;
}

export function QuickReplyPicker({ query, onSelect, onClose }: Props) {
  // TODO: Fetch quick replies from Supabase, filter by query
  const replies: QuickReply[] = [];
  const filtered = replies.filter(
    (r) =>
      r.shortcut.toLowerCase().includes(query.toLowerCase()) ||
      r.title.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute right-4 bottom-full left-4 mb-2 max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-gray-500">Quick Replies</span>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      {filtered.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.content)}
          className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-gray-50"
        >
          <span className="font-mono text-xs text-green-600">/{r.shortcut}</span>
          <span className="text-sm text-gray-700">{r.title}</span>
        </button>
      ))}
    </div>
  );
}
