export const runtime = "nodejs";

import { NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";

type DayKey = "sun"|"mon"|"tue"|"wed"|"thu"|"fri"|"sat";
type Range = { start: string; end: string };
type Hours = Record<DayKey, Range[] | "closed" | undefined>;

function parseHoursFromQuery(url: URL): Hours {
  const days: DayKey[] = ["sun","mon","tue","wed","thu","fri","sat"];
  const out: Hours = {} as any;
  for (const d of days) {
    const raw = url.searchParams.get(d);
    if (!raw) continue;
    if (raw.toLowerCase() === "closed") { (out as any)[d] = "closed"; continue; }
    const ranges: Range[] = [];
    for (const part of raw.split(",")) {
      const [a,b] = part.split("-");
      if (!a || !b) continue;
      ranges.push({ start: a.trim(), end: b.trim() });
    }
    (out as any)[d] = ranges;
  }
  return out;
}
function hasAnyHours(h: Hours) {
  return Object.keys(h).length > 0;
}
function within(day: DayKey, h: number, m: number, hours: Hours): boolean {
  const spec = hours[day];
  if (!spec) return false;
  if (spec === "closed") return false;
  const cur = h * 60 + m;
  for (const r of spec) {
    const [sh, sm] = r.start.split(":").map((x) => parseInt(x, 10));
    const [eh, em] = r.end.split(":").map((x) => parseInt(x, 10));
    const s = sh*60 + (sm||0);
    const e = eh*60 + (em||0);
    if (cur >= s && cur <= e) return true;
  }
  return false;
}
function dayKeyInTZ(tz: string): DayKey {
  const now = new Date();
  const wd = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: tz }).format(now).toLowerCase();
  const map: Record<string, DayKey> = { sun:"sun", mon:"mon", tue:"tue", wed:"wed", thu:"thu", fri:"fri", sat:"sat" };
  return map[wd as keyof typeof map] ?? "mon";
}

const FALLBACK: Record<string, Record<"greeting"|"off_hours", string>> = {
  en: {
    greeting: "Hi! 👋 How can we help today?",
    off_hours: "Thanks for reaching out! Our team is offline right now. We’ll reply when we’re back online."
  },
  hi: {
    greeting: "नमस्ते! 👋 हम आपकी किस तरह मदद कर सकते हैं?",
    off_hours: "धन्यवाद! अभी हमारी टीम ऑफलाइन है। हम ऑनलाइन आते ही जवाब देंगे।"
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ! 👋 ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    off_hours: "ಸಂದೇಶಕ್ಕೆ ಧನ್ಯವಾದಗಳು! ನಮ್ಮ ತಂಡ ಈಗ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಇದೆ. ಶೀಘ್ರದಲ್ಲೇ ಉತ್ತರಿಸುತ್ತೇವೆ."
  },
  ta: {
    greeting: "வணக்கம்! 👋 இன்று எப்படிச் சேவை செய்யலாம்?",
    off_hours: "உங்கள் செய்திக்கு நன்றி! இப்போது எங்கள் குழு ஆஃப்லைனில் உள்ளது. விரைவில் பதிலளிப்போம்."
  }
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wid = (url.searchParams.get("wid") || "").trim() || null;
    let locale = (url.searchParams.get("locale") || "en").trim().toLowerCase();
    const h = parseInt(url.searchParams.get("h") || "", 10);
    const m = parseInt(url.searchParams.get("m") || "", 10);

    // 1) Inline hours first
    let hours = parseHoursFromQuery(url);
    let tz = (url.searchParams.get("tz") || "").trim();

    // 2) If no inline hours, try DB hours
    if (!hasAnyHours(hours) && wid) {
      const supa = getSupabaseAdmin();
      const { data } = await supa
        .from("widget_hours")
        .select("tz,hours")
        .eq("widget_id", wid)
        .maybeSingle();
      if (data?.hours && typeof data.hours === "object") {
        hours = data.hours as Hours;
      }
      if (!tz && data?.tz) tz = data.tz;
    }

    // 3) Fallback tz if still empty
    if (!tz) tz = "Asia/Kolkata";

    // Decide kind using either inline or DB hours; if no hours at all, treat as off-hours only if h/m provided & not in any range
    const dkey = dayKeyInTZ(tz);
    let off = true;
    if (!Number.isNaN(h) && !Number.isNaN(m) && hasAnyHours(hours)) {
      off = !within(dkey, h, m, hours);
    } else if (Number.isNaN(h) || Number.isNaN(m)) {
      // No explicit time: assume business time logic can't be applied → default to greeting
      off = false;
    }
    const kind = (off ? "off_hours" : "greeting") as const;

    const supa = getSupabaseAdmin();
    async function pick(targetLocale: string, widgetFirst: boolean) {
      const base = supa.from("templates").select("id,name,locale,kind,body").eq("kind", kind);
      if (widgetFirst) {
        if (wid) {
          const a = await base.eq("locale", targetLocale).eq("widget_id", wid).limit(1);
          if (a.data?.length) return a.data[0];
        }
        const b = await base.eq("locale", targetLocale).is("widget_id", null).limit(1);
        if (b.data?.length) return b.data[0];
      } else {
        const b = await base.eq("locale", targetLocale).is("widget_id", null).limit(1);
        if (b.data?.length) return b.data[0];
        if (wid) {
          const a = await base.eq("locale", targetLocale).eq("widget_id", wid).limit(1);
          if (a.data?.length) return a.data[0];
        }
      }
      return null;
    }

    let chosen = await pick(locale, true);
    if (!chosen && locale !== "en") chosen = await pick("en", true);

    if (chosen) {
      return NextResponse.json({
        ok: true,
        decision: { tz, off, kind },
        chosen: { ...chosen, source: "db" },
        candidatesCount: 1
      });
    }

    const fbLocale = FALLBACK[locale] ? locale : "en";
    const body = FALLBACK[fbLocale][kind];
    return NextResponse.json({
      ok: true,
      decision: { tz, off, kind },
      chosen: {
        id: null,
        name: kind === "greeting" ? "Greeting (default)" : "Off-hours (default)",
        locale: fbLocale,
        kind,
        body,
        source: "default"
      },
      candidatesCount: 0
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "unknown" }, { status:500 });
  }
}
