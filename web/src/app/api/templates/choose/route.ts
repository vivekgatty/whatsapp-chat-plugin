export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";

/** ---------- Built-in defaults (so Day6-03 works even without DB rows) ---------- */
const DEFAULTS: Record<string, Record<string, { name: string; body: string }>> = {
  greeting: {
    en: { name: "Greeting (default)", body: "Hey! 👋 How can we help?" },
    hi: { name: "Greeting (default)", body: "नमस्ते! 👋 हम आपकी कैसे मदद कर सकते हैं?" },
    kn: { name: "Greeting (default)", body: "ನಮಸ್ಕಾರ! 👋 ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?" },
    ta: { name: "Greeting (default)", body: "வணக்கம்! 👋 எப்படிச் உதவலாம்?" },
  },
  off_hours: {
    en: { name: "Off-hours (default)", body: "Thanks for reaching out! Our team is offline right now. We’ll reply when we’re back online." },
    hi: { name: "Off-hours (default)", body: "संपर्क करने के लिए धन्यवाद! अभी हमारी टीम ऑफलाइन है। हम ऑनलाइन आते ही जवाब देंगे।" },
    kn: { name: "Off-hours (default)", body: "ಸಂಪರ್ಕಿಸಿದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ಈಗ ನಮ್ಮ ತಂಡ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಇಲ್ಲ. ನಾವು ಹಿಂದಿರುಗಿದ ಮೇಲೆ ಉತ್ತರಿಸುತ್ತೇವೆ." },
    ta: { name: "Off-hours (default)", body: "தொடர்பு கொண்டதற்கு நன்றி! இப்போது எங்கள் குழு ஆஃப்லைனில் உள்ளது. திரும்பி வந்தவுடன் பதிலளிப்போம்." },
  },
};

/** ---------- Off-hours helpers ---------- */
function parseWindow(v?: string | null): [number, number] | null {
  const s = (v || "").trim().toLowerCase();
  if (!s || s === "closed" || s === "off" || s === "x") return null;
  const m = s.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const aH = parseInt(m[1], 10), aM = parseInt(m[2], 10);
  const bH = parseInt(m[3], 10), bM = parseInt(m[4], 10);
  if (aH>23||bH>23||aM>59||bM>59) return null;
  const start = aH*60 + aM;
  const end   = bH*60 + bM;
  if (end <= start) return null;
  return [start, end];
}
function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }
function mmToHHMM(mm: number) { const h = Math.floor(mm/60), m = mm%60; return `${pad2(h)}:${pad2(m)}`; }
function nowInTZ(tz: string, forceHM?: {h?: number, m?: number}) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const wshort = (parts.find(p=>p.type==="weekday")?.value || "Fri").toLowerCase().slice(0,3);
  const map: Record<string,string> = { sun:"sun", mon:"mon", tue:"tue", wed:"wed", thu:"thu", fri:"fri", sat:"sat" };
  const weekday = map[wshort] || "fri";
  let hour = parseInt(parts.find(p=>p.type==="hour")?.value || "0",10);
  let minute = parseInt(parts.find(p=>p.type==="minute")?.value || "0",10);
  if (forceHM) {
    if (typeof forceHM.h === "number" && forceHM.h>=0 && forceHM.h<24) hour = forceHM.h;
    if (typeof forceHM.m === "number" && forceHM.m>=0 && forceHM.m<60) minute = forceHM.m;
  }
  return { weekday, hour, minute, hhmm: `${pad2(hour)}:${pad2(minute)}` };
}
function decideKind(u: URL) {
  const tz = u.searchParams.get("tz") || "Asia/Kolkata";
  const h  = u.searchParams.get("h");
  const m  = u.searchParams.get("m");
  const wantWhy = u.searchParams.get("why") === "1";
  const fallbackStart = u.searchParams.get("start") || "09:00";
  const fallbackEnd   = u.searchParams.get("end")   || "18:00";
  const fallback = parseWindow(`${fallbackStart}-${fallbackEnd}`);
  const dayKeys = ["sun","mon","tue","wed","thu","fri","sat"] as const;
  const perDay = Object.fromEntries(dayKeys.map(k => [k, u.searchParams.get(k)]));

  const { weekday, hour, minute, hhmm } = nowInTZ(tz, {
    h: h ? parseInt(h,10) : undefined,
    m: m ? parseInt(m,10) : undefined
  });
  const nowMin = hour*60 + minute;

  let win: [number, number] | null = null;
  const todayRaw = perDay[weekday as keyof typeof perDay] || "";
  if (todayRaw) {
    win = parseWindow(todayRaw);
  } else {
    if (weekday === "sat" || weekday === "sun") {
      win = null; // closed by default
    } else {
      win = fallback || parseWindow("09:00-18:00");
    }
  }

  const closed = !win;
  let off = true;
  let why = "";

  if (closed) {
    off = true;
    if (wantWhy) why = `closed (${weekday})`;
  } else {
    const [startMin, endMin] = win!;
    off = !(nowMin >= startMin && nowMin < endMin);
    if (wantWhy) {
      if (!off) {
        why = `within business hours (${mmToHHMM(startMin)}-${mmToHHMM(endMin)})`;
      } else {
        why = `outside business hours (${mmToHHMM(startMin)}-${mmToHHMM(endMin)}) at ${hhmm}`;
      }
    }
  }

  return { tz, off, kind: off ? "off_hours" : "greeting", why: wantWhy ? (why || null) : undefined };
}

/** Rank by (1) kind match, (2) locale match) */
function rankCandidate(r: any, targetKind: string, targetLocale: string) {
  const kindScore   = (r.kind === targetKind) ? 2 : (r.kind === "greeting" ? 1 : 0);
  const localeScore = (r.locale === targetLocale) ? 2 : (r.locale === "en" ? 1 : 0);
  return (kindScore * 100) + (localeScore * 10);
}

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    // Wid accepted for future, ignored for now (no templates.widget_id column yet)
    const localeRaw = (u.searchParams.get("locale") || "en").trim();
    // Clean up any accidental quotes like %22
    const locale = localeRaw.replace(/^"+|"+$/g, "");
    const decision = decideKind(u);
    const targetKind = decision.kind;

    const supa = getSupabaseAdmin();
    const kinds = Array.from(new Set([targetKind, "greeting"]));
    const locales = Array.from(new Set([locale, "en"]));

    const { data, error } = await supa
      .from("templates")
      .select("id,name,locale,kind,body")
      .in("kind", kinds as any)
      .in("locale", locales as any);

    if (error) {
      return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
    }

    const candidates = Array.isArray(data) ? data : [];
    if (candidates.length > 0) {
      const top = candidates
        .map(r => ({ r, score: rankCandidate(r, targetKind, locale) }))
        .sort((a,b) => b.score - a.score)[0].r;

      return NextResponse.json({
        ok: true,
        decision,
        chosen: { ...top, source: "db" },
        candidatesCount: candidates.length,
      });
    }

    // Fallback to built-in defaults
    const defaultsForKind = DEFAULTS[targetKind] || DEFAULTS["greeting"];
    const d = defaultsForKind[locale] || defaultsForKind["en"];
    return NextResponse.json({
      ok: true,
      decision,
      chosen: {
        id: null,
        name: d.name,
        locale: locale,
        kind: targetKind,
        body: d.body,
        source: "default",
      },
      candidatesCount: 0,
    });

  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || "unknown" }, { status: 500 });
  }
}
