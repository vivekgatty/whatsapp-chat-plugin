"use client";

import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Agent } from "@/types";

export default function TeamSettingsPage() {
  // TODO: Fetch agents for current workspace
  const agents: Agent[] = [];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Invite Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <p className="text-sm text-gray-500">No team members yet. You are the only one here.</p>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3 rounded-xl border bg-white p-4">
              <ContactAvatar name={agent.display_name} size="md" />
              <div className="flex-1">
                <span className="font-medium text-gray-900">{agent.display_name}</span>
                <p className="text-sm text-gray-500">{agent.email}</p>
              </div>
              <StatusBadge status={agent.role} />
              <div
                className={`h-2 w-2 rounded-full ${agent.is_online ? "bg-green-500" : "bg-gray-300"}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
