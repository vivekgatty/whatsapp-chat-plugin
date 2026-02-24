"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { getCustomFieldsForIndustry, type CustomFieldDefinition } from "@/lib/industry";

export default function CustomFieldsSettingsPage() {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [industry, setIndustry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CustomFieldDefinition["type"]>("text");
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const { data: ws } = await supabase.from("workspaces").select("industry").limit(1).single();

    const ind = ws?.industry ?? null;
    setIndustry(ind);
    setFields(getCustomFieldsForIndustry(ind));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  function handleAddField() {
    if (!newKey || !newLabel) return;
    setFields([
      ...fields,
      {
        key: newKey.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        label: newLabel,
        type: newType,
      },
    ]);
    setNewKey("");
    setNewLabel("");
    setNewType("text");
    setShowAddForm(false);
  }

  function handleRemoveField(key: string) {
    setFields(fields.filter((f) => f.key !== key));
  }

  const FIELD_TYPE_LABELS: Record<CustomFieldDefinition["type"], string> = {
    text: "Text",
    number: "Number",
    date: "Date",
    dropdown: "Dropdown",
    boolean: "Yes/No",
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Custom Fields</h1>
          {industry && (
            <p className="text-sm text-gray-500">
              Pre-configured for <span className="capitalize">{industry}</span> industry
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {showAddForm ? "Cancel" : "Add Field"}
        </button>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Custom fields appear in the contact detail panel and can be used in automation conditions
        and template variables.
      </p>

      {/* Add form */}
      {showAddForm && (
        <div className="mb-6 space-y-3 rounded-xl border bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Field Key</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) =>
                  setNewKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
                }
                placeholder="e.g. membership_id"
                className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Display Label</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Membership ID"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Field Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as CustomFieldDefinition["type"])}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {Object.entries(FIELD_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddField}
            disabled={!newKey || !newLabel}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Add Field
          </button>
        </div>
      )}

      {/* Fields list */}
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
        </div>
      ) : fields.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          No custom fields defined. Select an industry in workspace settings to get pre-configured
          fields, or add your own.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Options</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.key} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{field.key}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{field.label}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {FIELD_TYPE_LABELS[field.type]}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-gray-500">
                    {field.options?.join(", ") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemoveField(field.key)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Contact fields are stored in the <code>custom_fields</code> JSONB column. Use{" "}
        <code>{"{{contact.custom.field_key}}"}</code> in templates and automation messages.
      </p>
    </div>
  );
}
