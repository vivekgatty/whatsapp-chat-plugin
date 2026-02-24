"use client";

import { useState } from "react";
import type { Workspace } from "@/types";

export default function BillingSettingsPage() {
  // TODO: Fetch workspace billing info
  const [workspace] = useState<Workspace | null>(null);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Billing &amp; Usage</h1>

      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Current Plan</h3>
          <p className="mt-1 text-2xl font-bold text-green-600 capitalize">
            {workspace?.plan ?? "Trial"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {workspace?.subscription_status ?? "trialing"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Monthly Conversation Usage</h3>
          <div className="mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {workspace?.conversations_used_this_month ?? 0} /{" "}
                {workspace?.monthly_conversation_limit ?? 1000}
              </span>
              <span className="text-gray-400">conversations</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${Math.min(((workspace?.conversations_used_this_month ?? 0) / (workspace?.monthly_conversation_limit ?? 1000)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Upgrade Plan</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: "Starter", price: "₹999/mo", convos: "2,000" },
              { name: "Growth", price: "₹2,499/mo", convos: "10,000" },
              { name: "Pro", price: "₹4,999/mo", convos: "Unlimited" },
            ].map((plan) => (
              <div key={plan.name} className="rounded-lg border p-4">
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <p className="text-lg font-bold text-green-600">{plan.price}</p>
                <p className="text-xs text-gray-500">{plan.convos} conversations</p>
                <button className="mt-3 w-full rounded-lg border py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  Upgrade
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
