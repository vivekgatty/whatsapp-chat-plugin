// /api/widget-config/[id] — tolerant, normalized config for the widget
import { NextResponse } from "next/server";
// Use RELATIVE path to avoid alias issues
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------- helpers ----------

function defaults(id: string) {
  return {
    id,
    position: "right" as "left" | "right",
    themeColor: "#10b981",
    icon: "whatsapp" as "whatsapp" | "message" | "bolt",
    ctaText: "Chat with us on WhatsApp",
    prefillMessage: "Hey! I'd like to know more.",
    waNumber: null as string | null, // E.164 like +919876543210
    prechat: "off" as "on" | "off",
    requireName: true,
    requireMessage: false,
    v: null as number | null,
    online: true, // will be recomputed below
  };
}

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const IDX_TO_DAY: Record<number, DayKey> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

function hmToMinutes(hm: string | null | undefined): number | null {
  if (!hm || typeof hm !== "string") return null;
  const m = hm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
}

function nowHMInTZ(tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz || "UTC",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  // weekday short -> Sun/Mon/...
  const w = (parts.find((p) => p.type === "weekday")?.value ?? "Sun")
    .slice(0, 3)
    .toLowerCase(); // sun/mon/...

  const minutes = hour * 60 + minute;
  const dayIdx =
    w === "sun"
      ? 0
      : w === "mon"
      ? 1
      : w === "tue"
      ? 2
      : w === "wed"
      ? 3
      : w === "thu"
      ? 4
      : w === "fri"
      ? 5
      : 6;
  return { minutes, dayKey: IDX_TO_DAY[dayIdx], dayIdx };
}

function computeOnlineFromHours(opts: {
  workingHours: any;
  timezone: string;
}) {
  const tz = opts.timezone || "UTC";
  const wh = opts.workingHours || {};

  // Accept either:
  // A) per-day: { mon:{closed,from,to}, ... }
  // B) compact: { mon_fri:"09:00-18:00", sat:"10:00-14:00", sun:"off" }
  const expanded: Record<DayKey, { closed: boolean; from: string; to: string }> =
    {
      mon: { closed: true, from: "09:00", to: "18:00" },
      tue: { closed: true, from: "09:00", to: "18:00" },
      wed: { closed: true, from: "09:00", to: "18:00" },
      thu: { closed: true, from: "09:00", to: "18:00" },
      fri: { closed: true, from: "09:00", to: "18:00" },
      sat: { closed: true, from: "10:00", to: "14:00" },
      sun: { closed: true, from: "00:00", to: "00:00" },
    };

  if (wh && typeof wh === "object" && wh.mon && wh.tue) {
    // shape A
    (Object.keys(expanded) as DayKey[]).forEach((d) => {
      const v = wh[d];
      if (v && typeof v === "object") {
        expanded[d] = {
          closed: !!v.closed,
          from: v.from || "09:00",
          to: v.to || "18:00",
        };
      }
    });
  } else if (wh && (wh.mon_fri || wh.sat || wh.sun)) {
    // shape B
    const applyRange = (rng: string, days: DayKey[]) => {
      const m = rng.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
      if (!m) return;
      const from = m[1];
      const to = m[2];
      days.forEach((d) => (expanded[d] = { closed: false, from, to }));
    };
    if (wh.mon_fri) applyRange(wh.mon_fri, ["mon", "tue", "wed", "thu", "fri"]);
    if (wh.sat) applyRange(wh.sat, ["sat"]);
    if (wh.sun === "off") expanded.sun.closed = true;
  }

  const { minutes: nowMin, dayKey, dayIdx } = nowHMInTZ(tz);

  const today = expanded[dayKey];
  if (!today || today.closed) return false;

  const start = hmToMinutes(today.from);
  const end = hmToMinutes(today.to);
  if (start == null || end == null) return false;

  // handle overnight (e.g., 22:00-02:00)
  if (end > start) {
    return nowMin >= start && nowMin < end;
  } else if (end < start) {
    // wraps past midnight
    return nowMin >= start || nowMin < end;
  } else {
    // start == end → treat as closed
    return false;
  }
}

function coerceOverride(v: any): "online" | "offline" | "" {
  if (v === true || v === "online") return "online";
  if (v === false || v === "offline") return "offline";
  return "";
}

// ---------- route ----------

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id?: string }> }
) {
  try {
    const { id: widgetId } = await ctx.params;
    if (!widgetId) {
      return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
    }

    // 1) Fetch widget
    const { data: w, error: werr } = await supabaseAdmin
      .from("widgets")
      .select("*")
      .eq("id", widgetId)
      .maybeSingle();

    if (werr && werr.message) {
      return NextResponse.json(
        { ok: false, error: "lookup failed", detail: werr.message },
        { status: 500 }
      );
    }

    // 2) Fetch business if present
    const businessId = w?.business_id ?? w?.businessId ?? null;
    let biz: any = null;
    if (businessId) {
      const { data: b } = await supabaseAdmin
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .maybeSingle();
      biz = b || null;
    }

    // 3) Normalize with safe fallbacks
    const base = defaults(widgetId);
    const cfg = {
      ...base,
      position: (w?.position ?? base.position) as "left" | "right",
      themeColor: (w?.theme_color ?? w?.themeColor) ?? base.themeColor,
      icon: (w?.icon ?? base.icon) as "whatsapp" | "message" | "bolt",
      ctaText: (w?.cta_text ?? w?.ctaText) ?? base.ctaText,
      prefillMessage: (w?.prefill_message ?? w?.prefillMessage) ?? base.prefillMessage,
      waNumber:
        (w?.wa_number ??
          w?.waNumber ??
          biz?.whatsapp_e164 ??
          biz?.wa_number ??
          biz?.waNumber) ?? base.waNumber,
      prechat:
        (w?.prechat_enabled === true || String(w?.prechat).toLowerCase() === "on")
          ? "on"
          : base.prechat,
      requireName: Boolean(w?.require_name ?? w?.requireName ?? base.requireName),
      requireMessage: Boolean(w?.require_message ?? w?.requireMessage ?? base.requireMessage),
      v: (w?.version ?? w?.v ?? base.v),
    };

    // 4) Compute `online`
    const tz = biz?.timezone ?? biz?.tz ?? "UTC";
    const hours = biz?.working_hours ?? biz?.workingHours ?? null;
    const overrideRaw =
      w?.online_override ??
      biz?.online_override ??
      biz?.online ??
      biz?.is_online ??
      null;

    const override = coerceOverride(overrideRaw);
    const computed =
      override === "online"
        ? true
        : override === "offline"
        ? false
        : computeOnlineFromHours({ workingHours: hours, timezone: tz });

    const withOnline = { ...cfg, online: computed };

    return new NextResponse(JSON.stringify({ ok: true, config: withOnline }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=60",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server error" },
      { status: 500 }
    );
  }
}
