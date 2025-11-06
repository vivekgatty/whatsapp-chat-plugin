import { NextRequest, NextResponse } from "next/server";
import { resolveSystemTrigger } from "@/lib/triggerResolver";

// Match ONLY the embed script. This keeps the rest of the app untouched.
export const config = {
  matcher: ["/api/widget.js"],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const search = url.searchParams;

  // Seen flag cookie (lifecycle)
  const SEEN_COOKIE = "cm_seen";
  const seenFlag = req.cookies.get(SEEN_COOKIE)?.value === "1";

  // Locale guess: from header or ?locale=
  const accept = req.headers.get("accept-language") || "";
  const headerLocale = accept.split(",")[0]?.split("-")[0] || "";
  const locale = String(search.get("locale") || headerLocale || "").trim() || null;

  // Manual override & intent
  const manualOverride = search.get("trigger");
  const intent = search.get("intent");

  // UTM
  const utm = {
    campaign: search.get("utm_campaign"),
    source: search.get("utm_source"),
    medium: search.get("utm_medium"),
    term: search.get("utm_term"),
    content: search.get("utm_content"),
  };

  // Optional widget id (if you pass ?wid=... in your embed)
  const widget_id = search.get("wid");

  // Build TriggerContext for the resolver
  const ctx = {
    url: url.toString(),
    pathname: url.pathname,
    referrer: req.headers.get("referer"),
    locale,
    seenFlag,
    manualOverride,
    intent,
    utm,
  };

  // Resolve with deterministic priority
  const resolution = resolveSystemTrigger(ctx as any);
  if (resolution) {
    // Fire-and-forget analytics (do not block the response)
    // Use absolute URL so it works on edge
    const fireUrl = new URL("/api/analytics/trigger-fire", url);
    const body = {
      widget_id,
      code: resolution.code,
      type: resolution.type,
      why: resolution.why,
      page: url.pathname,
      locale,
    };

    try {
      await fetch(fireUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // swallow errors; don't break widget delivery
    }
  }

  // If first time, set seen cookie
  const res = NextResponse.next();
  if (!seenFlag) {
    res.cookies.set(SEEN_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 365 }); // 1 year
  }
  return res;
}
