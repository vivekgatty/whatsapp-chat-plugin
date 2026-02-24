"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Automation } from "@/types";

export default function AutomationsPage() {
  // TODO: Fetch automations
  const automations: Automation[] = [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
          <p className="text-sm text-gray-500">Automate responses, assignments, and workflows</p>
        </div>
        <Link
          href="/automations/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          New Automation
        </Link>
      </div>

      {automations.length === 0 ? (
        <EmptyState
          title="No automations yet"
          description="Create rules to auto-reply, assign agents, tag contacts, and more."
        />
      ) : (
        <div className="space-y-3">
          {automations.map((a) => (
            <a
              key={a.id}
              href={`/automations/${a.id}`}
              className="block rounded-xl border bg-white p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${a.is_active ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span className="font-medium text-gray-900">{a.name}</span>
                </div>
                <StatusBadge status={a.trigger_type} />
              </div>
              {a.description && <p className="mt-1 text-sm text-gray-500">{a.description}</p>}
              <p className="mt-2 text-xs text-gray-400">Triggered {a.times_triggered} times</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
