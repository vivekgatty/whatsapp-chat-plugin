"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Result = {
  label: string;
  url: string;
  ok: boolean;
  expected: string;
  got?: string;
  source?: string;
  body?: string;
  error?: string;
};

const DEFAULT_WID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";
const LOCALES = ["en", "hi", "kn", "ta"] as const;
const HOURS_QS = [
  "sun=closed",
  "mon=10:00-18:00","tue=10:00-18:00","wed=10:00-18:00",
  "thu=10:00-18:00","fri=10:00-18:00","sat=10:00-18:00",
].join("&");

export default function TemplatesQA() {
  const [wid, setWid] = useState<string>(DEFAULT_WID);
  const [withHours, setWithHours] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [rows, setRows] = useState<Result[]>([]);

  const base = useMemo(() => "https://chatmadi.com", []);
  const makeUrl = (locale: string, h: number, m: number, includeHours: boolean) => {
    const params = new URLSearchParams();
    if (wid) params.set("wid", wid);
    params.set("locale", locale);
    params.set("h", String(h));
    params.set("m", String(m));
    const core = `${base}/api/templates/choose?${params.toString()}`;
    return includeHours ? `${core}&${HOURS_QS}` : core;
  };

  async function run() {
    setRunning(true);
    const out: Result[] = [];
    // 11:15 -> greeting (if withHours is ON)
    for (const loc of LOCALES) {
      const url = makeUrl(loc, 11, 15, withHours);
      try {
        const r = await fetch(url, { cache: "no-store" });
        const j = await r.json();
        const got = j?.decision?.kind as string | undefined;
        const src = j?.chosen?.source as string | undefined;
        const body = j?.chosen?.body as string | undefined;
        const expected = withHours ? "greeting" : "off_hours";
        out.push({
          label: `${loc} @11:15`,
          url,
          ok: !!j?.ok && got === expected && !!body,
          expected,
          got,
          source: src,
          body,
          error: j?.error as string | undefined,
        });
      } catch (e: any) {
        out.push({ label: `${loc} @11:15`, url, ok: false, expected: withHours ? "greeting" : "off_hours", error: e?.message });
      }
    }
    // 23:30 -> off_hours (always)
    for (const loc of LOCALES) {
      const url = makeUrl(loc, 23, 30, false);
      try {
        const r = await fetch(url, { cache: "no-store" });
        const j = await r.json();
        const got = j?.decision?.kind as string | undefined;
        const src = j?.chosen?.source as string | undefined;
        const body = j?.chosen?.body as string | undefined;
        out.push({
          label: `${loc} @23:30`,
          url,
          ok: !!j?.ok && got === "off_hours" && !!body,
          expected: "off_hours",
          got,
          source: src,
          body,
          error: j?.error as string | undefined,
        });
      } catch (e: any) {
        out.push({ label: `${loc} @23:30`, url, ok: false, expected: "off_hours", error: e?.message });
      }
    }
    setRows(out);
    setRunning(false);
  }

  const passCount = rows.filter(r => r.ok).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates QA (Multilingual + Off-hours)</h1>
        <Link href={`/dashboard/templates${wid ? `?wid=${encodeURIComponent(wid)}` : ""}`} className="text-sm underline">
          ← Back to Templates
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Widget ID"
          value={wid}
          onChange={(e) => setWid(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" checked={withHours} onChange={(e) => setWithHours(e.target.checked)} />
          Include inline business hours for 11:15 checks (Mon–Sat 10–18, Sun closed)
        </label>
        <button
          disabled={running}
          onClick={run}
          className="rounded bg-sky-600 px-3 py-2 text-sm hover:bg-sky-500 disabled:opacity-50"
        >
          {running ? "Running…" : "Run tests"}
        </button>
      </div>

      <div className="mb-3 text-sm text-slate-400">Pass: {passCount}/{rows.length}</div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="py-2 pr-3">Case</th>
              <th className="py-2 pr-3">Expected</th>
              <th className="py-2 pr-3">Got</th>
              <th className="py-2 pr-3">Source</th>
              <th className="py-2 pr-3">Body (truncated)</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="py-6 text-slate-400">Click “Run tests”.</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-800 align-top">
                <td className="py-2 pr-3">{r.label}</td>
                <td className="py-2 pr-3">{r.expected}</td>
                <td className="py-2 pr-3">{r.got || "—"}</td>
                <td className="py-2 pr-3">{r.source || "—"}</td>
                <td className="max-w-[480px] truncate py-2 pr-3">{r.body || r.error || "—"}</td>
                <td className="py-2 pr-3">
                  <span className={r.ok ? "text-emerald-400" : "text-rose-400"}>{r.ok ? "PASS" : "FAIL"}</span>
                </td>
                <td className="py-2 pr-3"><a href={r.url} target="_blank" className="underline">open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
