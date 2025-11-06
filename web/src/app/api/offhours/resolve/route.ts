export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

/**
 * Parse "HH:MM-HH:MM" -> [startMin, endMin]
 * Return null for "closed" or invalid.
 */
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
  if (end <= start) return null; // same-day window only
  return [start, end];
}

function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }
function mmToHHMM(mm: number) { const h = Math.floor(mm/60), m = mm%60; return `${pad2(h)}:${pad2(m)}`; }

/** Get weekday "sun".."sat" and current hour/minute in given IANA tz. */
function nowInTZ(tz: string, forceHM?: {h?: number, m?: number}) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

export async function GET(req: NextRequest) {
  try {
    const u  = new URL(req.url);
    const tz = u.searchParams.get("tz") || "Asia/Kolkata";
    const h  = u.searchParams.get("h");
    const m  = u.searchParams.get("m");
    const wantWhy = u.searchParams.get("why") === "1";

    // Defaults: Mon-Fri 09:00-18:00, Sat/Sun closed
    const fallbackStart = u.searchParams.get("start") || "09:00";
    const fallbackEnd   = u.searchParams.get("end")   || "18:00";
    const fallback = parseWindow(`${fallbackStart}-${fallbackEnd}`); // may be null if bad

    const dayKeys = ["sun","mon","tue","wed","thu","fri","sat"] as const;
    const perDay = Object.fromEntries(dayKeys.map(k => [k, u.searchParams.get(k)]));

    const { weekday, hour, minute, hhmm } = nowInTZ(tz, {
      h: h ? parseInt(h,10) : undefined,
      m: m ? parseInt(m,10) : undefined
    });
    const nowMin = hour*60 + minute;

    // Window for today
    let win: [number, number] | null = null;
    const todayRaw = perDay[weekday as keyof typeof perDay] || "";
    if (todayRaw) {
      win = parseWindow(todayRaw);
    } else {
      // weekend default closed
      if (weekday === "sat" || weekday === "sun") {
        win = null;
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

    const templateKind = off ? "off_hours" : "greeting";

    return NextResponse.json({
      ok: true,
      ctx: { tz, weekday, time: hhmm },
      window: {
        start: win ? mmToHHMM(win[0]) : null,
        end:   win ? mmToHHMM(win[1]) : null,
        closed
      },
      resolution: {
        off_hours: off,
        code: off ? "off_hours" : "business_hours",
        why: wantWhy ? (why || null) : undefined
      },
      template: { kind: templateKind }
    });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || "unknown" }, { status: 500 });
  }
}
