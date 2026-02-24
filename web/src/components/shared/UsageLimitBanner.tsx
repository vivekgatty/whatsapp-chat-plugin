"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { evaluateUsage, type UsageLevel } from "@/lib/billing";

export function UsageLimitBanner() {
  const [level, setLevel] = useState<UsageLevel>("ok");
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = getBrowserSupabase();
      const { data: ws } = await supabase
        .from("workspaces")
        .select("plan, conversations_used_this_month")
        .limit(1)
        .single();

      if (ws) {
        const usage = evaluateUsage(ws.conversations_used_this_month ?? 0, ws.plan ?? "trial");
        setLevel(usage.level);
        setPercentage(Math.round(usage.percentage));
      }
    }
    load();
  }, []);

  if (level === "ok") return null;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm ${
        level === "hard_limit"
          ? "bg-red-100 text-red-800"
          : level === "soft_limit"
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      <span>
        {level === "hard_limit" ? (
          <>
            Outbound messages paused — you&apos;ve used <strong>{percentage}%</strong> of your
            conversation limit. Incoming messages still work.
          </>
        ) : level === "soft_limit" ? (
          <>
            You&apos;ve exceeded your conversation limit (<strong>{percentage}%</strong>). Upgrade
            to avoid interruptions.
          </>
        ) : (
          <>
            You&apos;ve used <strong>{percentage}%</strong> of your monthly conversations.
          </>
        )}
      </span>
      <Link
        href="/settings/billing"
        className={`rounded-lg px-3 py-1 text-xs font-medium text-white ${
          level === "hard_limit" || level === "soft_limit"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        Upgrade
      </Link>
    </div>
  );
}
