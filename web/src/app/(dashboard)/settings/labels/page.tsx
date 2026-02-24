"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { Label } from "@/types";

const DEFAULT_COLORS = [
  "#25D366",
  "#34B7F1",
  "#FFC107",
  "#FF5722",
  "#9C27B0",
  "#E91E63",
  "#00BCD4",
  "#4CAF50",
  "#FF9800",
  "#607D8B",
];

export default function LabelsSettingsPage() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("labels")
      .select("*")
      .order("display_order", { ascending: true });
    setLabels((data as unknown as Label[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!name) return;
    setSaving(true);
    // TODO: Insert label
    setSaving(false);
    setShowForm(false);
    setName("");
    load();
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Labels</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {showForm ? "Cancel" : "Add Label"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6 space-y-3 rounded-xl border bg-white p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Label Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hot Lead, VIP, Complaint"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Color</label>
            <div className="flex gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    color === c ? "border-gray-900" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !name}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Create Label"}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
        </div>
      ) : labels.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          No labels defined. Create labels to categorize conversations.
        </div>
      ) : (
        <div className="space-y-2">
          {labels.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-lg border bg-white p-3">
              <div className="h-5 w-5 rounded-full" style={{ backgroundColor: l.color }} />
              <div className="flex-1">
                <span className="font-medium text-gray-900">{l.name}</span>
                {l.description && <p className="text-xs text-gray-500">{l.description}</p>}
              </div>
              <span className="text-xs text-gray-400">{l.times_used} conversations</span>
              <button className="text-xs text-gray-400 hover:text-red-500">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
