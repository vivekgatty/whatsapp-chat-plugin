"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { AutomationTriggerType, AutomationActionType } from "@/types";

const TRIGGER_GROUPS: {
  label: string;
  items: { value: AutomationTriggerType; label: string; icon: string }[];
}[] = [
  {
    label: "Message Events",
    items: [
      { value: "new_conversation", label: "New conversation starts", icon: "💬" },
      { value: "keyword_match", label: "Message contains keyword", icon: "🔍" },
      { value: "no_reply_by_agent", label: "No agent reply in X hours", icon: "⏰" },
      { value: "no_reply_by_customer", label: "No customer reply in X hours", icon: "🕐" },
      { value: "first_message_of_day", label: "First message of day", icon: "🌅" },
    ],
  },
  {
    label: "Contact Events",
    items: [
      { value: "contact_created", label: "New contact created", icon: "👤" },
      { value: "contact_tag_added", label: "Tag added to contact", icon: "🏷️" },
      { value: "inactivity", label: "Contact inactive X days", icon: "💤" },
      { value: "birthday", label: "Contact birthday", icon: "🎂" },
    ],
  },
  {
    label: "Business Events",
    items: [
      { value: "conversation_resolved", label: "Conversation resolved", icon: "✅" },
      { value: "order_status_change", label: "Order status changes", icon: "📦" },
      { value: "appointment_reminder", label: "Appointment reminder", icon: "📅" },
      { value: "payment_overdue", label: "Payment overdue", icon: "💳" },
      { value: "time_based", label: "Scheduled (cron)", icon: "📆" },
      { value: "webhook", label: "External webhook", icon: "🔗" },
    ],
  },
];

const ACTION_OPTIONS: {
  value: AutomationActionType;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    value: "send_message",
    label: "Send message",
    icon: "💬",
    color: "bg-green-100 text-green-700",
  },
  {
    value: "send_template",
    label: "Send template",
    icon: "📋",
    color: "bg-green-100 text-green-700",
  },
  { value: "assign_agent", label: "Assign agent", icon: "👤", color: "bg-blue-100 text-blue-700" },
  { value: "add_tag", label: "Add tag", icon: "🏷️", color: "bg-purple-100 text-purple-700" },
  { value: "remove_tag", label: "Remove tag", icon: "🏷️", color: "bg-purple-100 text-purple-700" },
  {
    value: "update_status",
    label: "Update status",
    icon: "🔄",
    color: "bg-amber-100 text-amber-700",
  },
  {
    value: "update_lifecycle",
    label: "Update lifecycle",
    icon: "📊",
    color: "bg-amber-100 text-amber-700",
  },
  {
    value: "resolve_conversation",
    label: "Resolve conversation",
    icon: "✅",
    color: "bg-green-100 text-green-700",
  },
  {
    value: "snooze_conversation",
    label: "Snooze conversation",
    icon: "⏸️",
    color: "bg-gray-100 text-gray-700",
  },
  {
    value: "send_webhook",
    label: "Send webhook",
    icon: "🔗",
    color: "bg-indigo-100 text-indigo-700",
  },
  { value: "wait", label: "Wait", icon: "⏳", color: "bg-gray-100 text-gray-700" },
  { value: "notify_agent", label: "Notify agent", icon: "🔔", color: "bg-blue-100 text-blue-700" },
];

interface ActionBlock {
  id: string;
  type: AutomationActionType;
  config: Record<string, unknown>;
}

export default function AutomationBuilderPage() {
  const params = useParams<{ automationId: string }>();
  const router = useRouter();
  const isNew = params.automationId === "new";
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<AutomationTriggerType | "">("");
  const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});
  const [actions, setActions] = useState<ActionBlock[]>([]);
  const [saving, setSaving] = useState(false);

  function addAction(type: AutomationActionType) {
    setActions([...actions, { id: crypto.randomUUID(), type, config: {} }]);
  }

  function removeAction(id: string) {
    setActions(actions.filter((a) => a.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    // TODO: Save automation to DB
    setSaving(false);
    router.push("/automations");
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar: triggers */}
      <div className="hidden w-64 flex-shrink-0 overflow-y-auto border-r bg-gray-50 p-4 lg:block">
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Triggers
        </h3>
        {TRIGGER_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 text-xs font-medium text-gray-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setTrigger(item.value)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    trigger === item.value
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <h3 className="mt-6 mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Actions
        </h3>
        <div className="space-y-1">
          {ACTION_OPTIONS.map((action) => (
            <button
              key={action.value}
              onClick={() => addAction(action.value)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-gray-600 hover:bg-white"
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main canvas */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b bg-white px-6 py-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Automation name…"
            className="text-lg font-bold text-gray-900 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/automations")}
              className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name || !trigger}
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-4 p-6">
          {/* Trigger block */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                TRIGGER
              </span>
              <span className="text-sm font-medium text-gray-900">When this happens…</span>
            </div>
            {!trigger ? (
              <p className="text-sm text-gray-500">Select a trigger from the sidebar</p>
            ) : (
              <div className="space-y-3">
                <StatusBadge status={trigger} />
                {(trigger === "no_reply_by_agent" || trigger === "no_reply_by_customer") && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">After</span>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={triggerConfig.hours ?? "2"}
                      onChange={(e) =>
                        setTriggerConfig({ ...triggerConfig, hours: e.target.value })
                      }
                      className="w-20 rounded border px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-gray-600">hours</span>
                  </div>
                )}
                {trigger === "keyword_match" && (
                  <div>
                    <input
                      type="text"
                      placeholder="Keywords (comma-separated)"
                      value={triggerConfig.keywords ?? ""}
                      onChange={(e) =>
                        setTriggerConfig({ ...triggerConfig, keywords: e.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                    <div className="mt-2 flex gap-2">
                      {["any", "all"].map((m) => (
                        <label key={m} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="matchType"
                            checked={(triggerConfig.matchType ?? "any") === m}
                            onChange={() => setTriggerConfig({ ...triggerConfig, matchType: m })}
                          />
                          Match {m}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {trigger === "inactivity" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Inactive for</span>
                    <input
                      type="number"
                      min={1}
                      value={triggerConfig.days ?? "30"}
                      onChange={(e) => setTriggerConfig({ ...triggerConfig, days: e.target.value })}
                      className="w-20 rounded border px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-gray-600">days</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Connector */}
          {actions.length > 0 && (
            <div className="flex justify-center">
              <div className="h-8 w-0.5 bg-gray-300" />
            </div>
          )}

          {/* Action blocks */}
          {actions.map((action, idx) => {
            const meta = ACTION_OPTIONS.find((a) => a.value === action.type);
            return (
              <div key={action.id}>
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                        ACTION {idx + 1}
                      </span>
                      <span className="text-sm">
                        {meta?.icon} {meta?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAction(action.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  {action.type === "send_message" && (
                    <textarea
                      placeholder="Type your message…"
                      rows={2}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  )}
                  {action.type === "assign_agent" && (
                    <select className="w-full rounded border px-3 py-2 text-sm">
                      <option value="round_robin">Round Robin</option>
                      <option value="least_busy">Least Busy</option>
                    </select>
                  )}
                  {action.type === "add_tag" && (
                    <input
                      type="text"
                      placeholder="Tag name"
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  )}
                  {action.type === "wait" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        defaultValue={2}
                        className="w-20 rounded border px-2 py-1 text-sm"
                      />
                      <select className="rounded border px-2 py-1 text-sm">
                        <option>hours</option>
                        <option>days</option>
                      </select>
                    </div>
                  )}
                  {action.type === "send_webhook" && (
                    <input
                      type="url"
                      placeholder="https://your-api.com/webhook"
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  )}
                </div>
                {idx < actions.length - 1 && (
                  <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-gray-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Add action button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => addAction("send_message")}
              className="rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-sm text-gray-500 hover:border-green-400 hover:text-green-600"
            >
              + Add Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
