"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Agent, AgentRole } from "@/types";

export default function TeamSettingsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AgentRole>("agent");
  const [inviting, setInviting] = useState(false);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: true });
    setAgents((data as unknown as Agent[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    // TODO: Send invite email via Resend, create agent record
    setInviting(false);
    setInviteEmail("");
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900">
        Team Members
      </h1>

      {/* Invite form */}
      <div className="mb-6 rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-medium text-gray-900">Invite new member</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="agent@business.com"
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as AgentRole)}
            className="rounded-lg border px-3 py-2.5 text-sm"
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {inviting ? "…" : "Invite"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          They&apos;ll receive an email with a magic link to join your workspace.
        </p>
      </div>

      {/* Team list */}
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
        </div>
      ) : agents.length === 0 ? (
        <p className="text-sm text-gray-500">
          No team members yet. You&apos;re the only one here.
        </p>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4"
            >
              <ContactAvatar name={agent.display_name} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {agent.display_name}
                  </span>
                  <StatusBadge status={agent.role} />
                  {agent.is_online && (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{agent.email}</p>
                {agent.last_seen_at && (
                  <p className="text-xs text-gray-400">
                    Last seen:{" "}
                    {new Date(agent.last_seen_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <div>
                <select
                  defaultValue={agent.role}
                  className="rounded border px-2 py-1 text-xs text-gray-600"
                  disabled={agent.role === "owner"}
                >
                  <option value="owner" disabled>
                    Owner
                  </option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="readonly">Read-only</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
