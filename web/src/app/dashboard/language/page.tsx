"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LOCALES, getActiveLocale, setActiveLocale, t, type Locale } from "../../../lib/i18n";

export default function LanguagePage() {
  const [loc, setLoc] = useState<Locale>(getActiveLocale());
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSaved(false); }, [loc]);

  function save() {
    setActiveLocale(loc);
    setSaved(true);
    setTimeout(() => { try { location.reload(); } catch {} }, 400);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("language.title", loc)}</h1>
        <Link href="/dashboard" className="text-sm underline">{t("common.back", loc)}</Link>
      </div>

      <div className="mb-4 text-sm">{t("language.choose", loc)}</div>
      <div className="flex gap-2">
        <select
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          value={loc}
          onChange={(e) => setLoc(e.target.value as Locale)}
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button
          onClick={save}
          className="rounded bg-sky-600 px-4 py-2 text-sm hover:bg-sky-500"
        >
          {t("language.save", loc)}
        </button>
      </div>

      {saved && <div className="mt-2 text-sm text-emerald-400">{t("language.saved", loc)}</div>}

      <div className="mt-8">
        <div className="mb-2 text-sm">{t("language.links", loc)}</div>
        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/templates" className="underline">{t("templates.title", loc)}</Link>
          <Link href="/dashboard/widget" className="underline">{t("widget.title", loc)}</Link>
        </div>
      </div>
    </div>
  );
}
