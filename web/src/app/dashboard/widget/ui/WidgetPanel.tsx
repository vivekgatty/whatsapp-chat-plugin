"use client";
import * as React from "react";
import { getSupabaseBrowser } from "../../../../lib/supabaseBrowser";

type WidgetRow = {
  id?: string;
  owner_user_id: string;
  theme_color: string;
  button_position: "Left" | "Right";
  icon: string;
  cta_text: string;
  prefill_message: string;
  prechat_enabled: boolean;
  require_name: boolean;
  require_message: boolean;
  version: number;
};

export default function WidgetPanel({ userId, initial }: { userId: string; initial: any | null }) {
  const supabase = getSupabaseBrowser();

  const [row, setRow] = React.useState<WidgetRow>(() => ({
    id: initial?.id,
    owner_user_id: userId,
    theme_color: initial?.theme_color ?? "#10b981",
    button_position: initial?.button_position ?? "Right",
    icon: initial?.icon ?? "WhatsApp",
    cta_text: initial?.cta_text ?? "Chat with us on WhatsApp",
    prefill_message: initial?.prefill_message ?? "Hi! I'd like to know more.",
    prechat_enabled: !!initial?.prechat_enabled,
    require_name: initial?.require_name ?? true,
    require_message: initial?.require_message ?? true,
    version: initial?.version ?? 1,
  }));
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://chatmadi.com").replace(/\/$/, "");
  const embed = `<script src="${appUrl}/api/widget.js?id=${row.id ?? "<WIDGET_ID>"}${row.prechat_enabled ? "&prechat=on" : ""}" async></script>`;

  async function save() {
    setSaving(true);
    setMsg(null);
    setErr(null);
    const payload = { ...row, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from("widgets")
      .upsert(payload, { onConflict: "owner_user_id" })
      .select()
      .maybeSingle();

    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setRow((r) => ({ ...r, id: data?.id, version: data?.version ?? r.version }));
    setMsg("Widget saved.");
  }

  async function bumpVersion() {
    if (!row.id) return;
    const { data, error } = await supabase
      .from("widgets")
      .update({ version: (row.version ?? 1) + 1 })
      .eq("id", row.id)
      .select()
      .maybeSingle();

    if (error) {
      setErr(error.message);
      return;
    }
    setRow((r) => ({ ...r, version: data?.version ?? r.version + 1 }));
    setMsg("Version bumped.");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-zinc-700 p-4">
        <div>
          <span className="text-sm text-zinc-300">Theme color</span>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              value={row.theme_color}
              onChange={(e) => setRow((r) => ({ ...r, theme_color: e.target.value }))}
            />
            <input
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={row.theme_color}
              onChange={(e) => setRow((r) => ({ ...r, theme_color: e.target.value }))}
            />
          </div>
        </div>

        <label className="block">
          <span className="text-sm text-zinc-300">Button position</span>
          <select
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={row.button_position}
            onChange={(e) => setRow((r) => ({ ...r, button_position: e.target.value as any }))}
          >
            <option>Right</option>
            <option>Left</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-zinc-300">Icon</span>
          <select
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={row.icon}
            onChange={(e) => setRow((r) => ({ ...r, icon: e.target.value }))}
          >
            <option>WhatsApp</option>
            <option>Chat</option>
            <option>Message</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-zinc-300">CTA text</span>
          <input
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={row.cta_text}
            onChange={(e) => setRow((r) => ({ ...r, cta_text: e.target.value }))}
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-300">Prefill message</span>
          <textarea
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
            rows={3}
            value={row.prefill_message}
            onChange={(e) => setRow((r) => ({ ...r, prefill_message: e.target.value }))}
          />
        </label>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={row.prechat_enabled}
              onChange={(e) => setRow((r) => ({ ...r, prechat_enabled: e.target.checked }))}
            />
            <span>Enable pre-chat (collect name & message before opening WhatsApp)</span>
          </label>
          <label className="ml-6 flex items-center gap-2">
            <input
              type="checkbox"
              checked={row.require_name}
              onChange={(e) => setRow((r) => ({ ...r, require_name: e.target.checked }))}
            />
            <span>Require name</span>
          </label>
          <label className="ml-6 flex items-center gap-2">
            <input
              type="checkbox"
              checked={row.require_message}
              onChange={(e) => setRow((r) => ({ ...r, require_message: e.target.checked }))}
            />
            <span>Require message</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          <button onClick={bumpVersion} className="rounded-md border border-zinc-600 px-4 py-2">
            Bump version
          </button>
          {row.id && (
            <span className="self-center text-xs text-zinc-400">
              Widget ID: {row.id} | Version: {row.version}
            </span>
          )}
        </div>

        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        {err && <p className="text-sm text-red-400">{err}</p>}
      </div>

      <div className="rounded-xl border border-zinc-700 p-4">
        <p className="mb-2 text-sm text-zinc-400">Live preview</p>
        <div className="flex min-h-[220px] items-end justify-end rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <button
            className="rounded-full px-4 py-2 text-white"
            style={{ backgroundColor: row.theme_color }}
          >
            {row.cta_text}
          </button>
        </div>

        <p className="mt-4 mb-1 text-sm text-zinc-400">Embed snippet</p>
        <textarea
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          rows={3}
          readOnly
          value={embed}
        />
      </div>
    </div>
  );
}
