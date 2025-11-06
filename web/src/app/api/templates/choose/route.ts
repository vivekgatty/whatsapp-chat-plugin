export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../../lib/supabaseAdmin";

type TemplateRow = {
  id: string;
  name: string;
  locale: string;
  kind: string;
  body: string;
  widget_id: string | null;
};

type Range = { startM: number; endM: number }; // minutes since 00:00
type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
type HoursSpec = Partial<Record<DayKey, Range[]>>;

const DAY_KEYS: DayKey[] = ["sun","mon","tue","wed","thu","fri","sat"];

function toMinutes(h: number, m: number) {
  return (Math.max(0, Math.min(23, h)) * 60) + Math.max(0, Math.min(59, m));
}

function parseRangeToken(tok: string): Range | null {
  // Supports "10-18" and "10:00-18:00"
  const t = tok.trim();
  // 10:00-18:00
  let m = t.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (m) {
    const sh = +m[1], sm = +m[2], eh = +m[3], em = +m[4];
    return { startM: toMinutes(sh, sm), endM: toMinutes(eh, em) };
  }
  // 10-18
  m = t.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
  if (m) {
    const sh = +m[1], eh = +m[2];
    return { startM: toMinutes(sh, 0), endM: toMinutes(eh, 0) };
  }
  return null;
}

function parseDayValue(v: string): Range[] {
  // Examples:
  //  - "closed"
  //  - "10-18"
  //  - "10:00-13:00,14:00-18:00"
  const s = (v || "").trim().toLowerCase();
  if (!s || s === "closed" || s === "none") return [];
  const parts = s.split(",").map(x => x.trim()).filter(Boolean);
  const ranges: Range[] = [];
  for (const p of parts) {
    const r = parseRangeToken(p);
    if (r && r.startM < r.endM) ranges.push(r);
  }
  return ranges;
}

function parseInlineHours(sp: URLSearchParams): HoursSpec | null {
  let any = false;
  const spec: HoursSpec = {};
  for (const d of DAY_KEYS) {
    const val = sp.get(d);
    if (val !== null) {
      any = true;
      spec[d] = parseDayValue(val);
    }
  }
  return any ? spec : null;
}

function isOpenAt(spec: HoursSpec, dow: DayKey, minutesOfDay: number): boolean {
  const ranges = spec[dow] || [];
  for (const r of ranges) {
    if (minutesOfDay >= r.startM && minutesOfDay < r.endM) return true;
  }
  return false;
}

function getDowFromDate(date: Date, tz: string): DayKey {
  // Use Intl to get day index in the provided timezone (0=Sun..6=Sat)
  // We build a new date string using the parts API for safety.
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" });
  const wk = fmt.format(date).toLowerCase(); // sun, mon, ...
  const map: Record<string, DayKey> = { sun:"sun", mon:"mon", tue:"tue", wed:"wed", thu:"thu", fri:"fri", sat:"sat" };
  return map[wk] || "sun";
}

function minutesInTz(h: number, m: number, tz: string): { dow: DayKey; minutes: number } {
  // Build a date "today" in tz with hour/minute = h/m, then derive weekday
  const now = new Date();
  // Compute the same wall-clock h/m in tz by reconstructing from parts
  const partsFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit"
  });
  const [{ value: mm },, { value: dd },, { value: yyyy }] = partsFmt.formatToParts(now);
  const localIso = `${yyyy}-${mm}-${dd}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`;
  // new Date(localIso) is treated as local tz string; to ensure tz, append 'Z' trick won't apply.
  // We only need weekday as perceived in tz; we'll ask Intl on a Date object representing now, then override minutes.
  // Simpler: get weekday in tz using "now" (same calendar day), then use h/m as minutes since midnight.
  const dow = getDowFromDate(now, tz);
  const minutes = toMinutes(h, m);
  return { dow, minutes };
}

async function pickTemplate(
  supa: ReturnType<typeof getSupabaseAdmin>,
  wid: string | null,
  locale: string,
  kind: string
): Promise<{ chosen: any; count: number }> {
  // Prefer exact wid+locale+kind
  async function fetchOne(w: string | null, loc: string) {
    const q = supa.from("templates")
      .select("*")
      .eq("kind", kind)
      .eq("locale", loc)
      .order("created_at", { ascending: false })
      .limit(10) as any;

    const { data, error } = w
      ? await (q.eq("widget_id", w))
      : await (q.is("widget_id", null));

    if (error) throw new Error(error.message);
    return (data as TemplateRow[]) || [];
  }

  const tried: Array<{ src: "db"; wid: string | null; locale: string }> = [];
  let all: TemplateRow[] = [];

  if (wid) {
    tried.push({ src: "db", wid, locale });
    all = all.concat(await fetchOne(wid, locale));
  }
  if (all.length === 0) {
    tried.push({ src: "db", wid: null, locale });
    all = all.concat(await fetchOne(null, locale));
  }
  if (all.length === 0 && locale !== "en") {
    if (wid) all = all.concat(await fetchOne(wid, "en"));
    if (all.length === 0) all = all.concat(await fetchOne(null, "en"));
  }

  if (all.length > 0) {
    const t = all[0];
    return { chosen: { id: t.id, name: t.name, locale: t.locale, kind: t.kind, body: t.body, source: "db" }, count: all.length };
  }

  // Default fallbacks
  const defaults: Record<string, Record<string, string>> = {
    greeting: {
      en: "Hi! 👋 How can we help today?",
      hi: "नमस्ते! 👋 हम आपकी किस तरह मदद कर सकते हैं?",
      kn: "ನಮಸ್ಕಾರ! 👋 ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
      ta: "வணக்கம்! 👋 இன்று எப்படிச் சேவை செய்யலாம்?"
    },
    off_hours: {
      en: "Thanks for reaching out! Our team is offline right now. We’ll reply when we’re back online.",
      hi: "संपर्क करने के लिए धन्यवाद! अभी हमारी टीम ऑफलाइन है। हम ऑनलाइन आते ही जवाब देंगे।",
      kn: "ಸಂಪರ್ಕಿಸಿದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ನಮ್ಮ ತಂಡ ಈಗ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಇದೆ. ಶೀಘ್ರದಲ್ಲೇ ಉತ್ತರಿಸುತ್ತೇವೆ.",
      ta: "தொடர்பு கொண்டதற்கு நன்றி! எங்கள் குழு தற்போது ஆஃப்லைனில் உள்ளது. விரைவில் பதிலளிப்போம்."
    }
  };
  const loc = defaults[kind]?.[locale] ?? defaults[kind]?.["en"] ?? "Thanks!";
  return { chosen: { id: null, name: `${kind === "greeting" ? "Greeting" : "Off-hours"} (default)`, locale, kind, body: loc, source: "default" }, count: 0 };
}

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const sp = u.searchParams;

    const tz = sp.get("tz") || "Asia/Kolkata"; // accept alias later via Intl
    const wid = (sp.get("wid") || "").trim() || null;
    const localeRaw = (sp.get("locale") || "en").trim().toLowerCase();
    const locale = ["en","hi","kn","ta"].includes(localeRaw) ? localeRaw : localeRaw; // allow others with fallback

    // Time inputs (wall-clock in tz)
    const h = Math.max(0, Math.min(23, parseInt(sp.get("h") || "", 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt(sp.get("m") || "", 10) || 0));

    // Parse inline hours if provided
    const inlineHours = parseInlineHours(sp);

    // Compute day + minutes
    const pos = minutesInTz(h, m, tz);
    const dow = pos.dow; // as perceived "today" in tz
    const minutes = pos.minutes;

    let off = false;

    if (inlineHours) {
      // If any day keys present, use inlineHours strictly
      off = !isOpenAt(inlineHours, dow, minutes);
    } else {
      // No inline hours -> soft default: open 10:00-18:00 Mon–Sat, closed Sun
      const soft: HoursSpec = {
        sun: [],
        mon: [{ startM: toMinutes(10,0), endM: toMinutes(18,0) }],
        tue: [{ startM: toMinutes(10,0), endM: toMinutes(18,0) }],
        wed: [{ startM: toMinutes(10,0), endM: toMinutes(18,0) }],
        thu: [{ startM: toMinutes(10,0), endM: toMinutes(18,0) }],
        fri: [{ startM: toMinutes(10,0), endM: toMinutes(18,0) }],
        sat: [{ startM: toMinutes(10,0), endM: toMinutes(18,0) }],
      };
      off = !isOpenAt(soft, dow, minutes);
    }

    const kind = off ? "off_hours" : "greeting";

    const supa = getSupabaseAdmin();
    const picked = await pickTemplate(supa, wid, locale, kind);

    return NextResponse.json({
      ok: true,
      decision: { tz, off, kind },
      chosen: picked.chosen,
      candidatesCount: picked.count
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown error" }, { status: 500 });
  }
}
