import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { AutomationEngine } from "./engine";
import type { AutomationAction } from "@/types";

interface ActionContext {
  workspaceId: string;
  contactId?: string;
  conversationId?: string;
  triggerData?: Record<string, unknown>;
}

/**
 * Standalone action executor. Delegates to AutomationEngine
 * internally so all action logic is centralized.
 */
export async function executeAction(
  action: AutomationAction,
  context: ActionContext
): Promise<void> {
  const db = supabaseAdmin();
  const engine = new AutomationEngine(db, context.workspaceId);

  // Access the engine's private executeAction via a wrapper.
  // The engine handles all action types including send_message,
  // send_template, assign_agent, tags, status updates, webhooks, etc.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (engine as any).executeAction(action, context);
}
