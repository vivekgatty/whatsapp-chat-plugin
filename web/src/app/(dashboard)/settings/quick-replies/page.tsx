"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { QuickReply } from "@/types";

export default function QuickRepliesSettingsPage() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [shortcut, setShortcut] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("quick_replies")
      .select("*")
      .order("times_used", { ascending: false });
    setReplies((data as unknown as QuickReply[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!shortcut || !title || !content) return;
    setSaving(true);
    // TODO: Insert quick reply
    setSaving(false);
    setShowForm(false);
    setShortcut("");
    setTitle("");
    setContent("");
    load();
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quick Replies</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {showForm ? "Cancel" : "Add Reply"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6 space-y-3 rounded-xl border bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Shortcut</label>
              <div className="flex items-center rounded-lg border px-3 py-2">
                <span className="text-sm text-gray-400">/</span>
                <input
                  type="text"
                  value={shortcut}
                  onChange={(e) =>
                    setShortcut(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="hi"
                  className="ml-1 flex-1 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Greeting"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Message Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hi {{contact.name}}, how can I help you today?"
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Use {"{{contact.name}}"} for dynamic variables
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !shortcut || !content}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Create"}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
        </div>
      ) : replies.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            No quick replies yet. Create shortcuts like{" "}
            <code className="rounded bg-gray-100 px-1">/hi</code> or{" "}
            <code className="rounded bg-gray-100 px-1">/price</code>.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-3">Shortcut</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3 text-right">Used</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-green-600">/{r.shortcut}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">{r.content}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{r.times_used}×</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-gray-400 hover:text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
