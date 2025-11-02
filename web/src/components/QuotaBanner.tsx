"use client";
import { useEffect, useState } from "react";

export default function QuotaBanner() {
  const [state, setState] = useState<{loading:boolean; show:boolean; text:string; cta:string; href:string}>({
    loading: true, show: false, text: "", cta: "Upgrade to Pro", href: "/billing"
  });

  useEffect(() => {
    let ab = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/dashboard/usage", { signal: ab.signal });
        const j = await r.json();
        if (j?.ok && j?.usage) {
          const u = j.usage;
          if (u.plan === "free" && u.count >= u.limit) {
            setState({ loading:false, show:true, text:`You’ve hit the Free plan limit (${u.limit}/month).`, cta:"Upgrade to Pro", href:"/billing" });
            return;
          }
          if (u.plan === "free" && u.count >= Math.floor(u.limit*0.8)) {
            setState({ loading:false, show:true, text:`You’ve used ${u.count}/${u.limit} messages this month.`, cta:"Upgrade to Pro", href:"/billing" });
            return;
          }
        }
      } catch {}
      setState(s => ({...s, loading:false}));
    })();
    return () => ab.abort();
  }, []);

  if (!state.show || state.loading) return null;

  return (
    <div className="mb-4 rounded border border-amber-400/40 bg-amber-500/10 p-3 text-amber-200">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">{state.text}</div>
        <a href={state.href} className="rounded bg-amber-500 px-3 py-1.5 text-sm text-black hover:bg-amber-400">{state.cta}</a>
      </div>
    </div>
  );
}