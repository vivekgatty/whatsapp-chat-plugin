"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PLANS, getPlanByTier, evaluateUsage, getTrialDaysRemaining } from "@/lib/billing";
import type { Workspace } from "@/types";

const CANCEL_REASONS = [
  "Too expensive",
  "Not enough features",
  "Found a better tool",
  "Business closed / paused",
  "Too complicated to use",
  "WhatsApp API issues",
  "Other",
];

export default function BillingSettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const { data } = await supabase.from("workspaces").select("*").limit(1).single();
    setWorkspace(data as unknown as Workspace);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
      </div>
    );
  }

  const plan = getPlanByTier(workspace?.plan ?? "trial");
  const usage = evaluateUsage(
    workspace?.conversations_used_this_month ?? 0,
    workspace?.plan ?? "trial"
  );
  const trialDays = getTrialDaysRemaining(
    workspace?.subscription_status ?? null,
    workspace?.trial_ends_at ?? null
  );

  const usagePct = usage.limit === Infinity ? 0 : usage.percentage;
  const usageColor =
    usagePct >= 100 ? "bg-red-500" : usagePct >= 80 ? "bg-amber-500" : "bg-green-500";

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Billing &amp; Usage</h1>

      {/* Trial banner */}
      {trialDays !== null && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-800">
                {trialDays > 0
                  ? `${trialDays} day${trialDays !== 1 ? "s" : ""} left in your free trial`
                  : "Your trial has ended"}
              </p>
              <p className="mt-0.5 text-sm text-amber-600">Upgrade to keep your inbox running.</p>
            </div>
            <a
              href="#plans"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      )}

      {/* Current plan + usage */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Current Plan</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{plan.name}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {plan.priceDisplay}
            <span className="text-sm font-normal text-gray-400">/mo</span>
          </p>
          <div className="mt-2">
            <StatusBadge status={workspace?.subscription_status ?? "trialing"} />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Conversations This Month</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {usage.used.toLocaleString()}
            <span className="text-base font-normal text-gray-400">
              {" "}
              / {usage.limit === Infinity ? "Unlimited" : usage.limit.toLocaleString()}
            </span>
          </p>
          {usage.limit !== Infinity && (
            <>
              <div className="mt-3 h-2.5 rounded-full bg-gray-100">
                <div
                  className={`h-2.5 rounded-full transition-all ${usageColor}`}
                  style={{ width: `${Math.min(usagePct, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {Math.round(usagePct)}% used · Resets{" "}
                {workspace?.usage_reset_at
                  ? new Date(workspace.usage_reset_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                    })
                  : "next month"}
              </p>
            </>
          )}

          {/* Limit warnings */}
          {usage.level === "warning" && (
            <p className="mt-2 text-xs font-medium text-amber-600">
              You&apos;re approaching your limit. Consider upgrading.
            </p>
          )}
          {usage.level === "soft_limit" && (
            <p className="mt-2 text-xs font-medium text-red-600">
              You&apos;ve exceeded your limit. Conversations still work, but upgrade soon.
            </p>
          )}
          {usage.level === "hard_limit" && (
            <p className="mt-2 text-xs font-medium text-red-700">
              Outbound templates are paused. Upgrade to resume sending. Incoming messages still
              work.
            </p>
          )}
        </div>
      </div>

      {/* Plan limits breakdown */}
      <div className="mb-8 grid gap-3 sm:grid-cols-4">
        {[
          {
            label: "Agents",
            used: "—",
            limit: plan.agentsDisplay,
          },
          {
            label: "Broadcasts/mo",
            used: "—",
            limit: plan.broadcastsDisplay,
          },
          {
            label: "Automations",
            used: "—",
            limit: plan.automationsDisplay,
          },
          {
            label: "Conversations",
            used: usage.used.toLocaleString(),
            limit: plan.conversationsDisplay,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border bg-white p-3 text-center">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="mt-0.5 font-semibold text-gray-900">
              {item.used} / {item.limit}
            </p>
          </div>
        ))}
      </div>

      {/* Plan comparison table */}
      <h2 id="plans" className="mb-4 text-lg font-semibold text-gray-900">
        Plans
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const isCurrent = workspace?.plan === p.tier;
          return (
            <div
              key={p.tier}
              className={`relative rounded-xl border p-5 ${
                p.popular ? "border-green-500 shadow-md" : "border-gray-200"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-4 rounded-full bg-green-600 px-3 py-0.5 text-xs font-medium text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
              <p className="mt-1">
                <span className="text-2xl font-bold text-green-600">{p.priceDisplay}</span>
                <span className="text-sm text-gray-400">/mo</span>
              </p>
              <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                <p>{p.conversationsDisplay} conversations</p>
                <p>
                  {p.agentsDisplay} agent{p.agents !== 1 ? "s" : ""}
                </p>
                <p>{p.broadcastsDisplay} broadcasts</p>
                <p>{p.automationsDisplay} automations</p>
              </div>
              <div className="mt-4 border-t pt-3">
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="mt-0.5 text-green-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                disabled={isCurrent}
                className={`mt-4 w-full rounded-lg py-2 text-sm font-medium ${
                  isCurrent
                    ? "cursor-default border bg-gray-50 text-gray-400"
                    : p.popular
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "border text-gray-700 hover:bg-gray-50"
                }`}
              >
                {isCurrent ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoice history */}
      <div className="mb-8 rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-gray-900">Invoice History</h3>
        <p className="text-sm text-gray-500">
          Invoices from Razorpay will appear here once you subscribe.
        </p>
      </div>

      {/* Cancel subscription */}
      {workspace?.subscription_status === "active" && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          {!showCancel ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-800">Cancel Subscription</p>
                <p className="text-sm text-red-600">Your data will be preserved for 30 days.</p>
              </div>
              <button
                onClick={() => setShowCancel(true)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
              >
                Cancel Plan
              </button>
            </div>
          ) : !cancelConfirmed ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-red-800">We&apos;re sorry to see you go</h3>
              <p className="text-sm text-red-600">Help us improve — why are you leaving?</p>
              <div className="space-y-2">
                {CANCEL_REASONS.map((reason) => (
                  <label key={reason} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>

              {/* Retention offer */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="font-medium text-green-800">
                  Before you go — how about 30% off for the next 3 months?
                </p>
                <button className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                  Accept Offer &amp; Stay
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancel(false)}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Never mind
                </button>
                <button
                  onClick={() => setCancelConfirmed(true)}
                  disabled={!cancelReason}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-semibold text-red-800">Your subscription has been cancelled.</p>
              <p className="mt-1 text-sm text-red-600">
                You&apos;ll retain access until the end of your billing period. Your data is
                preserved for 30 days.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
