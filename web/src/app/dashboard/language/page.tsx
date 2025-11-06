"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SUPPORTED, getLocale, setLocale, loadMessages, t, type Messages } from "@/lib/i18n";

export default function LanguagePage() {
  const [locale, setLoc] = useState<string>("en");
  const [msgs, setMsgs] = useState<Messages>({});
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const current = getLocale();
    setLoc(current);
    loadMessages(current).then(setMsgs).catch(() => setMsgs({}));
  }, []);

  async function onChangeLang(next: string) {
    setLoc(next);
    const m = await loadMessages(next).catch(() => ({}));
    setMsgs(m);
  }

  async function onSave() {
    setSaving(true);
    const v = setLocale(locale);
    await loadMessages(v).then(setMsgs).catch(() => {});
    setSaving(false);
    setOk(t("language.saved", msgs, "Saved!"));
    setTimeout(() => setOk(null), 1200);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("language.title", msgs, "Language")}</h1>
        <Link href="/dashboard" className="text-sm underline">← {t("dashboard.title", msgs, "Dashboard")}</Link>
      </div>

      <label className="mb-1 block text-sm">{t("language.select", msgs, "Select language")}</label>
      <select
        className="mb-3 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
        value={locale}
        onChange={(e) => onChangeLang(e.target.value)}
      >
        {SUPPORTED.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <button
        onClick={onSave}
        disabled={saving}
        className="rounded bg-sky-600 px-4 py-2 text-sm hover:bg-sky-500 disabled:opacity-50"
      >
        {t("language.save", msgs, "Save language")}
      </button>

      {ok && <div className="mt-3 text-sm text-emerald-400">{ok}</div>}

      <div className="mt-8 rounded border border-slate-700 p-4 text-sm">
        <div className="mb-2 font-medium">Preview</div>
        <div>• {t("templates.title", msgs, "Templates")}</div>
        <div>• {t("templates.embedHeading", msgs, "Embed snippet")}</div>
        <div>• {t("templates.autoHeading", msgs, "Auto-trigger loader (optional)")}</div>
      </div>
    </div>
  );
}
