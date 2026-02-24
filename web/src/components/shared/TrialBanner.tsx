"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { getTrialDaysRemaining } from "@/lib/billing";

export function TrialBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getBrowserSupabase();
      const { data: ws } = await supabase
        .from("workspaces")
        .select("subscription_status, trial_ends_at")
        .limit(1)
        .single();

      if (ws) {
        setDaysLeft(getTrialDaysRemaining(ws.subscription_status, ws.trial_ends_at));
      }
    }
    load();
  }, []);

  if (daysLeft === null) return null;

  const urgent = daysLeft <= 3;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm ${
        urgent ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      <span>
        {daysLeft > 0 ? (
          <>
            <strong>
              {daysLeft} day{daysLeft !== 1 ? "s" : ""}
            </strong>{" "}
            left in your free trial
          </>
        ) : (
          <strong>Your free trial has ended</strong>
        )}
      </span>
      <Link
        href="/settings/billing"
        className={`rounded-lg px-3 py-1 text-xs font-medium text-white ${
          urgent ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        Upgrade Now
      </Link>
    </div>
  );
}
