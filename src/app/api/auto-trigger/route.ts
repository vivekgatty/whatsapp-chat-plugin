import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wid = searchParams.get("wid") || ""; // optional

  // Precompute the wid line to avoid nested `${...}` in the JS payload
  const widAttr = wid
    ? `p.set("wid", ${JSON.stringify(wid)});`
    : `if (window.CHATMADI && CHATMADI.wid) p.set("wid", CHATMADI.wid);`;

  const js = `(() => {
    try {
      if (window.__cm_auto_trigger_fired) return;
      window.__cm_auto_trigger_fired = true;

      const u = new URL(window.location.href);
      const seen = (localStorage.getItem("cm_seen") === "1");
      const locale = (navigator.language || "").split("-")[0] || "";

      const q = new URLSearchParams();
      q.set("url", window.location.href);
      q.set("pathname", window.location.pathname || "/");
      if (locale) q.set("locale", locale);
      if (u.searchParams.get("intent")) q.set("intent", u.searchParams.get("intent"));
      ["utm_campaign","utm_source","utm_medium","utm_term","utm_content","trigger"].forEach(k=>{
        const v = u.searchParams.get(k); if (v) q.set(k, v);
      });
      q.set("seen", seen ? "1" : "0");

      fetch("/api/triggers/resolve?" + q.toString(), { credentials:"omit" })
        .then(r => r.json())
        .then(res => {
          if (!res || !res.resolution) return;
          const r = res.resolution;
          const p = new URLSearchParams();
          p.set("code", r.code);
          p.set("type", r.type);
          p.set("why", r.why);
          p.set("pathname", window.location.pathname || "/");
          if (locale) p.set("locale", locale);
          ${widAttr}
          fetch("/api/analytics/trigger-fire?" + p.toString(), { credentials:"omit" });
          try { localStorage.setItem("cm_seen","1"); } catch(e){}
        })
        .catch(()=>{});
    } catch (e) {}
  })();`;

  return new NextResponse(js, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
