"use client";

import type { QuickReply } from "@/types";

export default function QuickRepliesSettingsPage() {
  // TODO: Fetch quick replies
  const replies: QuickReply[] = [];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quick Replies</h1>
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Add Reply
        </button>
      </div>

      {replies.length === 0 ? (
        <p className="text-sm text-gray-500">
          No quick replies yet. Create shortcuts like /hi or /price.
        </p>
      ) : (
        <div className="space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-green-600">/{r.shortcut}</span>
                <span className="text-xs text-gray-400">Used {r.times_used}x</span>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">{r.title}</p>
              <p className="mt-0.5 text-sm text-gray-500">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
