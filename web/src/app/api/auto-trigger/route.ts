export const runtime = "edge"; // small & fast

export async function GET(req: Request) {
  const js = `(()=>{try{
    if(typeof window==="undefined"){return;}

    // Read wid from the script tag's ?wid= param
    var wid = "";
    try{
      var cs = document.currentScript;
      if(cs && cs.src){
        var u = new URL(cs.src, location.href);
        wid = u.searchParams.get("wid") || "";
      }
    }catch(e){}

    // Page context
    var loc = window.location;
    var url = String(loc.href || "");
    var pathname = String(loc.pathname || "/");
    var locale = ((navigator.language||"").split("-")[0]||"");
    var seen = false;
    try{ seen = (localStorage.getItem("cm_seen")==="1"); }catch(e){}

    // Collect UTM/intent/campaign hints from the URL
    var u = new URL(url, loc.origin);
    var q = new URLSearchParams();
    q.set("url", url);
    q.set("pathname", pathname);
    if(locale) q.set("locale", locale);
    var intent = u.searchParams.get("intent");
    if(intent) q.set("intent", intent);
    ["utm_campaign","utm_source","utm_medium","utm_term","utm_content","trigger"].forEach(k=>{
      var v = u.searchParams.get(k);
      if(v) q.set(k, v);
    });
    q.set("seen", seen ? "1" : "0");

    // 1) Resolve the most relevant trigger for this visit
    fetch("/api/triggers/resolve?" + q.toString(), { credentials:"omit" })
      .then(r => r.json())
      .then(res => {
        if(!res || !res.resolution) return;
        var r = res.resolution;

        // 2) Fire analytics row
        var p = new URLSearchParams();
        p.set("code", r.code);
        p.set("type", r.type);
        p.set("why",  r.why);
        p.set("pathname", pathname);
        if(locale) p.set("locale", locale);
        if(wid)    p.set("wid", wid);

        // Also forward common UTM params if present
        ["utm_campaign","utm_source","utm_medium","utm_term","utm_content"].forEach(k=>{
          var v = u.searchParams.get(k);
          if(v) p.set(k, v);
        });

        fetch("/api/analytics/trigger-fire?" + p.toString(), { credentials:"omit" });

        try { localStorage.setItem("cm_seen","1"); } catch(e){}
      })
      .catch(()=>{});
  }catch(e){}})();`;

  return new Response(js, {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
}
