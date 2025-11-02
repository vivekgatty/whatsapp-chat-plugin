"use client";

import { useEffect, useMemo, useState } from "react";

type WidgetSettings = {
  widget_id: string;
  theme_color: string;                // hex like #10b981
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

  // Build snippet
  const embedSnippet = useMemo(() => {
    const id = settings.widget_id?.trim() || "<WIDGET_ID>";
    return `<script src="https://chatmadi.com/api/widget.js?id=${id}" async></script>`;
  }, [settings.widget_id]);

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Widget settings</h1>

      <a href="/dashboard" className="text-sm underline inline-block mb-6">
        &larr; Back to dashboard
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-1">Widget ID</label>
            <input
              value={settings.widget_id}
              onChange={(e) => field("widget_id", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
              placeholder="eg. 4b5e8f9a-..."
            />
            <p className="text-xs text-slate-400 mt-1">
              This appears in your embed snippet. If unsure, keep <code>&lt;WIDGET_ID&gt;</code> and replace it on your site later.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Theme color (hex)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => field("theme_color", e.target.value)}
                  className="h-10 w-14 rounded bg-slate-900 border border-slate-700"
                  aria-label="Theme color"
                />
                <input
                  value={settings.theme_color}
                  onChange={(e) => field("theme_color", e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Button position</label>
              <select
                value={settings.button_position}
                onChange={(e) =>
                  field("button_position", e.target.value as WidgetSettings["button_position"])
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Icon</label>
            <select
              value={settings.icon}
              onChange={(e) => field("icon", e.target.value as WidgetSettings["icon"])}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="chat">Chat</option>
              <option value="message">Message</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">CTA text</label>
            <input
              value={settings.cta_text}
              onChange={(e) => field("cta_text", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
              placeholder="Chat with us on WhatsApp"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Prefill message</label>
            <textarea
              value={settings.prefill_message}
              onChange={(e) => field("prefill_message", e.target.value)}
              className="w-full h-28 bg-slate-900 border border-slate-700 rounded px-3 py-2"
              placeholder="Hi! I'd like to know more."
            />
          </div>

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

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              className={cx("rounded px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500")}
            >
              Save settings
            </button>
            <button
              onClick={resetToDefaults}
              className="rounded px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700"
            >
              Reset
            </button>
            {okMsg && <span className="text-emerald-400 text-sm">{okMsg}</span>}
          </div>
        </div>

        {/* Right: preview + snippet */}
        <div className="space-y-6">
          <div>
            <div className="text-sm mb-2">Live preview</div>
            <div className="rounded border border-slate-700 p-6 h-64 flex items-center justify-center">
              <div
                className="rounded-full px-4 py-2 text-sm text-black"
                style={{ backgroundColor: settings.theme_color }}
              >
                {settings.cta_text}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm mb-2">Embed snippet</div>
            <textarea
              className="w-full h-28 bg-slate-900 border border-slate-700 rounded px-3 py-2"
              readOnly
              value={embedSnippet}
            />
            <p className="text-xs text-slate-400 mt-1">
              Paste this on your site where you want the chat bubble. Replace{" "}
              <code>&lt;WIDGET_ID&gt;</code> with your actual id if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
