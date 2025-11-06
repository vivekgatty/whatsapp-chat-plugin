"use client";

import { useEffect, useMemo, useState } from "react";

type WidgetSettings = {
  widget_id: string;
  theme_color: string; // hex like #10b981
  button_position: "right" | "left";
  icon: "whatsapp" | "chat" | "message";
  cta_text: string;
  prefill_message: string;
  prechat_require_name: boolean;
  prechat_require_message: boolean;
};

const DEFAULTS: WidgetSettings = {
  widget_id: "",
  theme_color: "#10b981",
  button_position: "right",
  icon: "whatsapp",
  cta_text: "Chat with us on WhatsApp",
  prefill_message: "Hi! I'd like to know more.",
  prechat_require_name: true,
  prechat_require_message: true,
};

const LS_KEY = "chatmadi_widget_settings";

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function WidgetSettingsPage() {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULTS);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Load from localStorage only (no backend calls)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch {
      // ignore parse errors; keep defaults
    }
  }, []);

  const id = (settings.widget_id || "").trim() || "<WIDGET_ID>";

  // Build snippets (avoid template literals to prevent accidental JSX bleed)
  const embedSnippet = useMemo(
    () => '<script src="https://chatmadi.com/api/widget.js?id=' + id + '" async></script>',
    [id]
  );

  const autoTriggerSnippet = useMemo(
    () => '<script src="https://chatmadi.com/api/auto-trigger?wid=' + id + '" async></script>',
    [id]
  );

  function field<K extends keyof WidgetSettings>(key: K, val: WidgetSettings[K]) {
    setSettings((s) => ({ ...s, [key]: val }));
  }

  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(settings));
      setOkMsg("Saved!");
      setTimeout(() => setOkMsg(null), 2000);
    } catch {
      setOkMsg("Could not save (storage full?)");
      setTimeout(() => setOkMsg(null), 2000);
    }
  }

  function resetToDefaults() {
    setSettings(DEFAULTS);
    localStorage.removeItem(LS_KEY);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Widget settings</h1>

      <a href="/dashboard" className="mb-6 inline-block text-sm underline">
        &larr; Back to dashboard
      </a>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: form */}
        <div className="space-y-6">
          {/* Widget ID */}
          <div>
            <label className="mb-1 block text-sm">Widget ID</label>
            <input
              value={settings.widget_id}
              onChange={(e) => field("widget_id", e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
              placeholder="eg. 4b5e8f9a-..."
            />
            <p className="mt-1 text-xs text-slate-400">
              This appears in your embed snippet. If unsure, keep{" "}
              <code>&lt;WIDGET_ID&gt;</code> and replace it on your site later.
            </p>
          </div>

          {/* Auto-trigger loader (optional) */}
          <div>
            <label className="block text-sm">Auto-trigger loader (optional)</label>
            <textarea
              readOnly
              rows={2}
              className="h-20 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
              value={autoTriggerSnippet}
            />
            <p className="mt-1 text-xs text-slate-400">
              Paste this directly under the widget tag to enable automatic rule-based triggers &amp; analytics.
            </p>
          </div>

          {/* Theme color + position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm">Theme color (hex)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => field("theme_color", e.target.value)}
                  className="h-10 w-14 rounded border border-slate-700 bg-slate-900"
                  aria-label="Theme color"
                />
                <input
                  value={settings.theme_color}
                  onChange={(e) => field("theme_color", e.target.value)}
                  className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm">Button position</label>
              <select
                value={settings.button_position}
                onChange={(e) =>
                  field("button_position", e.target.value as WidgetSettings["button_position"])
                }
                className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="mb-1 block text-sm">Icon</label>
            <select
              value={settings.icon}
              onChange={(e) => field("icon", e.target.value as WidgetSettings["icon"])}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="chat">Chat</option>
              <option value="message">Message</option>
            </select>
          </div>

          {/* CTA */}
          <div>
            <label className="mb-1 block text-sm">CTA text</label>
            <input
              value={settings.cta_text}
              onChange={(e) => field("cta_text", e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
              placeholder="Chat with us on WhatsApp"
            />
          </div>

          {/* Prefill message */}
          <div>
            <label className="mb-1 block text-sm">Prefill message</label>
            <textarea
              value={settings.prefill_message}
              onChange={(e) => field("prefill_message", e.target.value)}
              className="h-28 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
              placeholder="Hi! I'd like to know more."
            />
          </div>

          {/* Pre-chat */}
          <div className="space-y-3">
            <label className="block text-sm">Pre-chat (collect before opening WhatsApp)</label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.prechat_require_name}
                onChange={(e) => field("prechat_require_name", e.target.checked)}
                className="h-4 w-4"
              />
              Require name
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.prechat_require_message}
                onChange={(e) => field("prechat_require_message", e.target.checked)}
                className="h-4 w-4"
              />
              Require message
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              className={cx("rounded bg-sky-600 px-4 py-2 text-sm hover:bg-sky-500")}
            >
              Save settings
            </button>
            <button
              onClick={resetToDefaults}
              className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
            >
              Reset
            </button>
            {okMsg && <span className="text-sm text-emerald-400">{okMsg}</span>}
          </div>
        </div>

        {/* Right: preview + main embed snippet */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 text-sm">Live preview</div>
            <div className="flex h-64 items-center justify-center rounded border border-slate-700 p-6">
              <div
                className="rounded-full px-4 py-2 text-sm text-black"
                style={{ backgroundColor: settings.theme_color }}
              >
                {settings.cta_text}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Embed snippet</label>
            <textarea
              className="h-28 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
              readOnly
              value={embedSnippet}
            />
            <p className="mt-1 text-xs text-slate-400">
              Paste this on your site where you want the chat bubble. Replace{" "}
              <code>&lt;WIDGET_ID&gt;</code> with your actual id if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
