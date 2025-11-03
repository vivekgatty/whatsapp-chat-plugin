"use client";
import { useEffect, useState } from "react";

export default function QuotaBanner() {
  const [s, setS] = useState<{plan:string; used:number; limit:number; ok:boolean} | null>(null);
  useEffect(() => {
    fetch("/api/usage/status", { cache: "no-store" })
      .then(r => r.json())
      .then(setS)
      .catch(()=>{});
  }, []);
  if (!s || s.ok) return null;

  return (
    <div className="mb-4 rounded-lg border border-amber-500 bg-amber-900/30 p-3 text-amber-200">
      <div className="font-semibold">You’ve reached your Free plan limit ({s.used}/{s.limit} messages this month).</div>
      <button
        onClick={() => document.getElementById("upgrade-btn")?.dispatchEvent(new Event("click", { bubbles:true }))}
        className="mt-2 rounded bg-amber-600 px-3 py-1 text-black"
      >
        Upgrade to Pro
      </button>
    </div>
  );
}