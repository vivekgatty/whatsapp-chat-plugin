"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppPreview } from "@/components/shared/WhatsAppPreview";
import type { TemplateCategory } from "@/types";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
];

export default function NewTemplatePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [metaName, setMetaName] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("UTILITY");
  const [language, setLanguage] = useState("en");
  const [headerType, setHeaderType] = useState<"none" | "text" | "image">("none");
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<{ type: string; text: string }[]>([]);
  const [variableExamples, setVariableExamples] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function autoMetaName(display: string) {
    setDisplayName(display);
    setMetaName(
      display
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
    );
  }

  function insertVariable() {
    const varCount = (bodyText.match(/\{\{\d+\}\}/g) ?? []).length;
    const next = varCount + 1;
    setBodyText(bodyText + `{{${next}}}`);
  }

  function addButton() {
    if (buttons.length < 3) {
      setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
    }
  }

  const variables = bodyText.match(/\{\{(\d+)\}\}/g) ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: Submit to /api/whatsapp/templates
    setSaving(false);
    router.push("/templates");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Create Template</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !bodyText || !metaName}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Submitting…" : "Submit for Approval"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-5xl gap-8 p-6 lg:grid-cols-[1fr,340px]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => autoMetaName(e.target.value)}
                  placeholder="Welcome Message"
                  className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Meta Template Name
                </label>
                <input
                  type="text"
                  value={metaName}
                  onChange={(e) =>
                    setMetaName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="welcome_message"
                  className="w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm"
                >
                  <option value="UTILITY">Utility (order updates, reminders)</option>
                  <option value="MARKETING">Marketing (promotions, offers)</option>
                  <option value="AUTHENTICATION">Authentication (OTPs)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Header */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Header</label>
              <div className="flex gap-2">
                {(["none", "text", "image"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setHeaderType(t)}
                    className={`rounded-lg border px-3 py-1.5 text-xs capitalize ${
                      headerType === t
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "text-gray-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {headerType === "text" && (
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Header text"
                  maxLength={60}
                  className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
                />
              )}
            </div>

            {/* Body */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Body Text <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={insertVariable}
                    className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                  >
                    + Variable
                  </button>
                  <span className="text-xs text-gray-400">{bodyText.length}/1024</span>
                </div>
              </div>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={5}
                maxLength={1024}
                placeholder="Hi {{1}}, thank you for contacting {{2}}!"
                className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Variable examples */}
            {variables.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Variable Examples (required by Meta)
                </p>
                <div className="space-y-2">
                  {variables.map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <span className="w-16 rounded bg-green-100 px-2 py-1 text-center text-xs font-medium text-green-700">
                        {v}
                      </span>
                      <input
                        type="text"
                        value={variableExamples[v] ?? ""}
                        onChange={(e) =>
                          setVariableExamples({ ...variableExamples, [v]: e.target.value })
                        }
                        placeholder={`Example for ${v}`}
                        className="flex-1 rounded border px-3 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Footer <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                maxLength={60}
                placeholder="e.g. Reply STOP to unsubscribe"
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
              />
              <span className="text-xs text-gray-400">{footerText.length}/60</span>
            </div>

            {/* Buttons */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Buttons <span className="font-normal text-gray-400">(optional, up to 3)</span>
                </label>
                <button
                  type="button"
                  onClick={addButton}
                  disabled={buttons.length >= 3}
                  className="text-xs text-green-600 hover:underline disabled:text-gray-400"
                >
                  + Add button
                </button>
              </div>
              {buttons.map((btn, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <select
                    value={btn.type}
                    onChange={(e) => {
                      const next = [...buttons];
                      next[i] = { ...btn, type: e.target.value };
                      setButtons(next);
                    }}
                    className="rounded border px-2 py-1.5 text-sm"
                  >
                    <option value="QUICK_REPLY">Quick Reply</option>
                    <option value="URL">URL</option>
                    <option value="PHONE_NUMBER">Phone</option>
                  </select>
                  <input
                    type="text"
                    value={btn.text}
                    onChange={(e) => {
                      const next = [...buttons];
                      next[i] = { ...btn, text: e.target.value };
                      setButtons(next);
                    }}
                    placeholder="Button text"
                    className="flex-1 rounded border px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setButtons(buttons.filter((_, j) => j !== i))}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              Estimated approval time: Usually approved in 24–48 hours by Meta.
            </div>
          </form>

          {/* Preview */}
          <div className="lg:sticky lg:top-6">
            <p className="mb-3 text-sm font-medium text-gray-700">WhatsApp Preview</p>
            <WhatsAppPreview
              header={headerType === "text" ? headerText : undefined}
              body={bodyText || "Your message preview…"}
              footer={footerText || undefined}
            />
            {buttons.length > 0 && (
              <div className="mx-auto mt-1 max-w-xs space-y-1">
                {buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-white py-2 text-center text-sm text-blue-600"
                  >
                    {btn.text || `Button ${i + 1}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
