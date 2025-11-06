export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../lib/supabaseAdmin";

type Row = { id: string; name: string; locale: string; kind: "greeting" | "off_hours"; body: string };

const LOCALES = ["en","hi","kn","ta"] as const;
const DOW_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;

type Range = { start: number; end: number };
type Week = Record<(typeof DOW_KEYS)[number], Range[]>;

function parseHm(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function parseRanges(s: string): Range[] {
  const out: Range[] = [];
  for (const part of s.split(",").map(x => x.trim()).filter(Boolean)) {
    const [a, b] = part.split("-").map(x => x.trim());
    const sa = parseHm(a), sb = parseHm(b);
    if (sa != null && sb != null && sb > sa) out.push({ start: sa, end: sb });
  }
  return out;
}

function hoursFromQuery(u: URL): Week | null {
  let any = false;
  const wk: Partial<Week> = {};
  for (const k of DOW_KEYS) {
    const v = u.searchParams.get(k);
    if (v == null) continue;
    any = true;
    if (v.toLowerCase() === "closed" || v.trim() === "") {
      wk[k] = [];
    } else {
      wk[k] = parseRanges(v);
    }
  }
  if (!any) return null;
  // fill any missing day as closed
  for (const k of DOW_KEYS) {
    if (!wk[k]) wk[k] = [];
  }
  return wk as Week;
}

function defaultWeek(): Week {
  // Mon–Sat 10:00–18:00, Sun closed
  const day = [{ start: 10 * 60, end: 18 * 60 }];
  return {
    sun: [],
    mon: day, tue: day, wed: day, thu: day, fri: day, sat: day,
  };
}

function isOpenAt(week: Week, dow: number, minutes: number): boolean {
  const key = DOW_KEYS[dow] as (typeof DOW_KEYS)[number];
  const ranges = week[key] || [];
  return ranges.some(r => minutes >= r.start && minutes < r.end);
}

function getDowInTZ(tz: string): number {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" });
  const w = fmt.format(now).toLowerCase().slice(0, 3) as "sun"|"mon"|"tue"|"wed"|"thu"|"fri"|"sat";
  return Math.max(0, DOW_KEYS.indexOf(w));
}

function minutesInTZ(tz: string, h?: number, m?: number): number {
  if (typeof h === "number" && typeof m === "number") return h * 60 + m;
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB",{ timeZone: tz, hour:"2-digit", minute:"2-digit", hour12:false });
  const [hh, mm] = fmt.format(now).split(":").map(Number);
  return hh * 60 + mm;
}

const DEFAULTS: Record<string, Record<"greeting"|"off_hours", string>> = {
  en: {
    greeting: "Hi! 👋 How can we help today?",
    off_hours: "Thanks for reaching out! Our team is offline right now. We’ll reply when we’re back online.",
  },
  hi: {
    greeting: "नमस्ते! 👋 हम आपकी किस तरह मदद कर सकते हैं?",
    off_hours: "धन्यवाद! अभी हमारी टीम ऑफलाइन है, हम ऑनलाइन होते ही जवाब देंगे।",
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ! 👋 ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    off_hours: "ಸಂದೇಶಕ್ಕೆ ಧನ್ಯವಾದಗಳು! ನಮ್ಮ ತಂಡ ಈಗ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಇದೆ. ಶೀಘ್ರದಲ್ಲೇ ಉತ್ತರಿಸುತ್ತೇವೆ.",
  },
  ta: {
    greeting: "வணக்கம்! 👋 இன்று எப்படிச் சேவை செய்யலாம்?",
    off_hours: "உங்கள் செய்திக்கு நன்றி! இப்போது எங்கள் குழு ஆஃப்லைனில் உள்ளது. விரைவில் பதிலளிப்போம்.",
  },
};

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const wid = u.searchParams.get("wid") || null;

    const localeRaw = (u.searchParams.get("locale") || "en").toLowerCase();
    const locale = (LOCALES as readonly string[]).includes(localeRaw) ? (localeRaw as (typeof LOCALES)[number]) : "en";

    const tz = u.searchParams.get("tz") || "Asia/Kolkata";
    const h = u.searchParams.get("h");
    const m = u.searchParams.get("m");
    const H = h != null && h !== "" ? parseInt(h, 10) : undefined;
    const M = m != null && m !== "" ? parseInt(m, 10) : undefined;

    // Hours: inline > (TODO: DB) > fallback Mon–Sat 10–18, Sun closed
    const inline = hoursFromQuery(u);
    const week = inline ?? defaultWeek();

    const dow = getDowInTZ(tz);
    const minutes = minutesInTZ(tz, H, M);

    const off = !isOpenAt(week, dow, minutes);
    const kind: "off_hours" | "greeting" = off ? "off_hours" : "greeting";

    const supa = getSupabaseAdmin();

    async function pick(targetLocale: string) {
      const { data } = await supa
        .from("templates")
        .select("id,name,locale,kind,body")
        .eq("kind", kind)
        .eq("locale", targetLocale)
        .limit(5);
      if (!data || data.length === 0) return null;
      return data[0] as Row;
    }

    let chosen = await pick(locale);
    if (!chosen && locale !== "en") chosen = await pick("en");

    const defaults = DEFAULTS[locale] ?? DEFAULTS["en"];
    return NextResponse.json({
      ok: true,
      decision: { tz, off, kind },
      chosen: chosen ?? {
        id: null,
        name: kind === "off_hours" ? "Off-hours (default)" : "Greeting (default)",
        locale,
        kind,
        body: defaults[kind],
        source: "default",
      },
      candidatesCount: chosen ? 1 : 0,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
