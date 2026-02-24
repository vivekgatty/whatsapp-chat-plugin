"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { AutomationTriggerType } from "@/types";

const TRIGGER_OPTIONS: { value: AutomationTriggerType; label: string }[] = [
  { value: "new_conversation", label: "New conversation starts" },
  { value: "keyword_match", label: "Message contains keyword" },
  { value: "no_reply_by_agent", label: "No agent reply in X hours" },
  { value: "no_reply_by_customer", label: "No customer reply in X hours" },
  { value: "contact_created", label: "New contact created" },
  { value: "conversation_resolved", label: "Conversation resolved" },
  { value: "time_based", label: "Scheduled (cron)" },
  { value: "inactivity", label: "Contact inactive for X days" },
  { value: "contact_tag_added", label: "Tag added to contact" },
  { value: "order_status_change", label: "Order status changes" },
  { value: "appointment_reminder", label: "Appointment reminder" },
  { value: "payment_overdue", label: "Payment overdue" },
  { value: "birthday", label: "Contact birthday" },
  { value: "webhook", label: "External webhook" },
];

export default function AutomationBuilderPage() {
  const params = useParams<{ automationId: string }>();
  const isNew = params.automationId === "new";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isNew ? "Create Automation" : "Edit Automation"}
      </h1>

      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Trigger</h2>
          <p className="mb-3 text-sm text-gray-600">When should this automation run?</p>
          <select className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
            <option value="">Select a trigger…</option>
            {TRIGGER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Conditions</h2>
          <p className="text-sm text-gray-500">
            Optional filters to narrow which contacts this applies to.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions</h2>
          <p className="text-sm text-gray-500">What should happen when the trigger fires.</p>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/automations"
            className="rounded-lg border px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700">
            Save Automation
          </button>
        </div>
      </div>
    </div>
  );
}
