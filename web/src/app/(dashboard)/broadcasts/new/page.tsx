"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppPreview } from "@/components/shared/WhatsAppPreview";
import type { BroadcastAudienceType } from "@/types";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Audience", "Template", "Schedule", "Review"];

export default function NewBroadcastPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [audienceType, setAudienceType] = useState<BroadcastAudienceType>("all");
  const [tagFilter, setTagFilter] = useState("");
  const [estimatedRecipients] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSend() {
    setSaving(true);
    // TODO: Create broadcast, populate broadcast_messages, trigger /api/broadcasts/send
    setSaving(false);
    router.push("/broadcasts");
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Step indicators */}
      <div className="mb-8 flex gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i + 1 <= step
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      <h1 className="mb-6 text-xl font-bold text-gray-900">
        Create Broadcast
      </h1>

      {/* Step 1: Audience */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Broadcast Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. January Promo, Appointment Reminders"
              className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Select Audience
            </label>
            <div className="space-y-2">
              {(
                [
                  { value: "all", label: "All opted-in contacts" },
                  { value: "tag", label: "By tag" },
                  { value: "segment", label: "By lifecycle stage" },
                  { value: "manual", label: "Manual selection" },
                ] as { value: BroadcastAudienceType; label: string }[]
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                    audienceType === opt.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={opt.value}
                    checked={audienceType === opt.value}
                    onChange={() => setAudienceType(opt.value)}
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {audienceType === "tag" && (
              <input
                type="text"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                placeholder="Enter tag name…"
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            )}
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            Estimated recipients:{" "}
            <strong>{estimatedRecipients.toLocaleString()}</strong>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!name}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Next: Choose Template →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Template */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Select Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setTemplateBody(e.target.value ? "Hi {{1}}, {{2}}" : "");
              }}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            >
              <option value="">Choose an approved template…</option>
              <option value="welcome">Welcome Message</option>
              <option value="promo">Promotion</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          {templateBody && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Variable Mapping
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">
                      {"{{1}}"} — Source
                    </label>
                    <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                      <option>contact.name</option>
                      <option>Static text</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      {"{{2}}"} — Source
                    </label>
                    <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                      <option>Static text</option>
                      <option>contact.name</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Preview
                </p>
                <WhatsAppPreview body={templateBody} />
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border px-6 py-2.5 text-sm text-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedTemplate}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Next: Schedule →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
              <input
                type="radio"
                name="schedule"
                checked={scheduleType === "now"}
                onChange={() => setScheduleType("now")}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Send now</p>
                <p className="text-xs text-gray-500">
                  Messages sent at ~30/second to respect Meta rate limits
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
              <input
                type="radio"
                name="schedule"
                checked={scheduleType === "later"}
                onChange={() => setScheduleType("later")}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Schedule for later
                </p>
                <p className="text-xs text-gray-500">
                  Pick a date and time
                </p>
              </div>
            </label>
          </div>
          {scheduleType === "later" && (
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          )}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border px-6 py-2.5 text-sm text-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Broadcast</span>
                <span className="font-medium text-gray-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Template</span>
                <span className="font-medium text-gray-900">
                  {selectedTemplate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipients</span>
                <span className="font-medium text-gray-900">
                  {estimatedRecipients.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Schedule</span>
                <span className="font-medium text-gray-900">
                  {scheduleType === "now" ? "Send immediately" : scheduleDate}
                </span>
              </div>
            </div>
          </div>

          {estimatedRecipients > 1000 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              This broadcast will use approximately{" "}
              {estimatedRecipients.toLocaleString()} conversations from your
              monthly limit.
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="rounded-lg border px-6 py-2.5 text-sm text-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleSend}
              disabled={saving}
              className="rounded-lg bg-green-600 px-8 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving
                ? "Sending…"
                : scheduleType === "now"
                  ? "Send Broadcast"
                  : "Schedule Broadcast"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
