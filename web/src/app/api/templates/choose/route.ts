export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import getSupabaseAdmin from "../../../../lib/supabaseAdmin";
import { DEFAULT_TZ, DEFAULT_HOURS, decideKind, HoursMap } from "../../../../lib/offhours";

const DEFAULTS: Record<string, { greeting: string; off_hours: string }> = {
  en: {
    greeting: "Hi! 👋 How can we help?",
    off_hours: "Thanks for reaching out! Our team is offline right now. We’ll reply when we’re back online.",
  },
  hi: {
    greeting: "नमस्ते! 👋 हम आपकी कैसे मदद कर सकते हैं?",
    off_hours: "संपर्क करने के लिए धन्यवाद! अभी हमारी टीम ऑफलाइन है। हम ऑनलाइन आते ही जवाब देंगे।",
  },
  kn: {
    greeting: "ಹಾಯ್! 👋 ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    off_hours: "ಸಂಪರ್ಕಿಸಿದವರಿಗೆ ಧನ್ಯವಾದಗಳು! ಈಗ ನಮ್ಮ ತಂಡ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಇದೆ. ಆನ್‌ಲೈನ್ ಆದ ತಕ್ಷಣ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತೇವೆ.",
  },
  ta: {
    greeting: "வணக்கம்! 👋 எப்படிச் உதவலாம்?",
    off_hours: "தொடர்புக்கு நன்றி! தற்போது எங்கள் குழு ஆன்லைனில் இல்லை. திரும்ப வந்தவுடன் பதில் தருகிறோம்.",
  },
};

function normLocale(l: string | null): "en" | "hi" | "kn" | "ta" {
  const x = (l || "en").toLowerCase().replace(/[^a-z]/g,"");
  return (["en","hi","kn","ta"].includes(x) ? (x as any) : "en");
}

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const supa = getSupabaseAdmin();

    const wid = u.searchParams.get("wid");            // optional
    const locale = normLocale(u.searchParams.get("locale"));

    // Optional overrides for testing: h, m, sun=closed etc.
    const h = u.searchParams.get("h");  // "0".."23"
    const m = u.searchParams.get("m");  // "0".."59"
    const dowClosedFlag = ["sun","mon","tue","wed","thu","fri","sat"].find(k => u.searchParams.get(k) === "closed");

    // 1) Resolve business timezone + hours (by wid -> business) else default
    let tz = DEFAULT_TZ;
    let hours: HoursMap = DEFAULT_HOURS;

    if (wid) {
      const w = await supa.from("widgets").select("business_id").eq("id", wid).maybeSingle();
      const bid = (w.data?.business_id as string | null) || null;
      if (bid) {
        const b = await supa.from("businesses").select("timezone,hours").eq("id", bid).maybeSingle();
        if (!b.error) {
          tz = (b.data?.timezone as string) || DEFAULT_TZ;
          hours = (b.data?.hours as any) || DEFAULT_HOURS;
        }
      }
    }

    // 2) Decide kind using hours + tz (with optional overrides)
    const override = {
      h: h ? parseInt(h, 10) : undefined,
      m: m ? parseInt(m, 10) : undefined,
      dow: undefined as number | undefined,
      closedFlag: !!dowClosedFlag,
    };
    if (dowClosedFlag) {
      // map str -> 0..6; sun=0
      const idx = ["sun","mon","tue","wed","thu","fri","sat"].indexOf(dowClosedFlag);
      override.dow = idx >= 0 ? idx : undefined;
    }
    const kind = decideKind(tz, hours, override);

    // 3) Try DB templates for (locale, kind), else default strings
    const { data, error } = await supa
      .from("templates")
      .select("id,name,locale,kind,body")
      .eq("kind", kind)
      .in("locale", [locale, "en"])
      .order("locale", { ascending: false }); // prefer exact, then en

    if (!error && Array.isArray(data) && data.length > 0) {
      // Prefer exact locale if present
      const exact = data.find(t => t.locale === locale) || data[0];
      return NextResponse.json({
        ok: true,
        decision: { tz, off: kind === "off_hours", kind },
        chosen: { ...exact, source: "db" },
        candidatesCount: data.length
      });
    }

    // Fallback
    const pack = DEFAULTS[locale] || DEFAULTS["en"];
    const name = kind === "off_hours" ? "Off-hours (default)" : "Greeting (default)";
    const body = kind === "off_hours" ? pack.off_hours : pack.greeting;

    return NextResponse.json({
      ok: true,
      decision: { tz, off: kind === "off_hours", kind },
      chosen: { id: null, name, locale, kind, body, source: "default" },
      candidatesCount: 0
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "unknown" }, { status:500 });
  }
}
