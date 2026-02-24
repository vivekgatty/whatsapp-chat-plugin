import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { NotificationType } from "@/types";

interface NotifyOptions {
  workspaceId: string;
  agentId: string;
  type: NotificationType;
  title: string;
  body?: string;
  conversationId?: string;
  contactId?: string;
}

/**
 * Creates an in-app notification record. Supabase Realtime will
 * automatically push the insert to subscribed clients.
 */
export async function createNotification(options: NotifyOptions): Promise<void> {
  const db = supabaseAdmin();

  await db.from("notifications").insert({
    workspace_id: options.workspaceId,
    agent_id: options.agentId,
    type: options.type,
    title: options.title,
    body: options.body ?? null,
    conversation_id: options.conversationId ?? null,
    contact_id: options.contactId ?? null,
  });
}

/**
 * Notifies all online agents in a workspace (except the sender).
 */
export async function notifyWorkspaceAgents(
  workspaceId: string,
  excludeAgentId: string | null,
  type: NotificationType,
  title: string,
  body?: string,
  conversationId?: string
): Promise<void> {
  const db = supabaseAdmin();

  const query = db
    .from("agents")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true);

  if (excludeAgentId) {
    query.neq("id", excludeAgentId);
  }

  const { data: agents } = await query;
  if (!agents || agents.length === 0) return;

  const notifications = agents.map((agent) => ({
    workspace_id: workspaceId,
    agent_id: agent.id,
    type,
    title,
    body: body ?? null,
    conversation_id: conversationId ?? null,
  }));

  await db.from("notifications").insert(notifications);
}
