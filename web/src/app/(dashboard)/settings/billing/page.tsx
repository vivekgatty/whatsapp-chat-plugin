"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Workspace } from "@/types";

const PLANS = [
  {
    name: "Starter",
    price: "₹999",
    period: "/mo",
    convos: "2,000",
    features: [
      "2 agents",
      "2,000 conversations/month",
      "Basic automations",
      "Quick replies",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "₹2,499",
    period: "/mo",
    convos: "10,000",
    popular: true,
    features: [
      "5 agents",
      "10,000 conversations/month",
      "Advanced automations",
      "Broadcasts",
      "API access",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: "₹4,999",
    period: "/mo",
    convos: "Unlimited",
    features: [
      "Unlimited agents",
      "Unlimited conversations",
      "Custom integrations",
      "Dedicated support",
      "White-label option",
      "Custom reporting",
    ],
  },
];

export default function BillingSettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .limit(1)
      .single();
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

  const usedPct = workspace
    ? Math.min(
        ((workspace.conversations_used_this_month ?? 0) /
          (workspace.monthly_conversation_limit ?? 1000)) *
          100,
        100,
      )
    : 0;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900">
        Billing & Usage
      </h1>

      {/* Current plan + usage */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Current Plan</p>
          <p className="mt-1 text-2xl font-bold capitalize text-green-600">
            {workspace?.plan ?? "Trial"}
          </p>
          <div className="mt-2">
            <StatusBadge
              status={workspace?.subscription_status ?? "trialing"}
            />
          </div>
          {workspace?.trial_ends_at &&
            workspace.subscription_status === "trialing" && (
              <p className="mt-2 text-xs text-gray-500">
                Trial ends:{" "}
                {new Date(workspace.trial_ends_at).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "long", year: "numeric" },
                )}
              </p>
            )}
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Monthly Conversations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {workspace?.conversations_used_this_month?.toLocaleString() ?? 0}
            <span className="text-base font-normal text-gray-400">
              {" "}
              / {workspace?.monthly_conversation_limit?.toLocaleString() ?? "1,000"}
            </span>
          </p>
          <div className="mt-3 h-2.5 rounded-full bg-gray-100">
            <div
              className={`h-2.5 rounded-full transition-all ${
                usedPct > 90
                  ? "bg-red-500"
                  : usedPct > 70
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Resets{" "}
            {workspace?.usage_reset_at
              ? new Date(workspace.usage_reset_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                })
              : "next month"}
          </p>
        </div>
      </div>

      {/* Plan comparison */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Upgrade Plan
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-5 ${
              plan.popular ? "border-green-500 shadow-md" : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-4 rounded-full bg-green-600 px-3 py-0.5 text-xs font-medium text-white">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="mt-1">
              <span className="text-2xl font-bold text-green-600">
                {plan.price}
              </span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {plan.convos} conversations
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <span className="text-green-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`mt-5 w-full rounded-lg py-2 text-sm font-medium ${
                plan.popular
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {workspace?.plan === plan.name.toLowerCase()
                ? "Current Plan"
                : "Upgrade"}
            </button>
          </div>
        ))}
      </div>

      {/* Invoice history placeholder */}
      <div className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-gray-900">Invoice History</h3>
        <p className="text-sm text-gray-500">
          Invoice history from Razorpay will appear here.
        </p>
      </div>
    </div>
  );
}
