import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { evaluateConditions } from "./conditions";
import { executeAction } from "./actions";
import type { Automation } from "@/types";

interface ExecutionContext {
  contactId?: string;
  conversationId?: string;
  triggerData?: Record<string, unknown>;
}

interface ExecutionResult {
  status: "success" | "partial" | "failed";
  actionsExecuted: { type: string; success: boolean; error?: string }[];
  error?: string;
}

/**
 * Runs a single automation's actions against the given context.
 */
export async function executeAutomation(
  automation: Automation,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const actionsExecuted: ExecutionResult["actionsExecuted"] = [];

  try {
    if (automation.conditions && automation.conditions.length > 0) {
      const conditionsMet = await evaluateConditions(automation.conditions, context);
      if (!conditionsMet) {
        return { status: "success", actionsExecuted: [] };
      }
    }

    for (const action of automation.actions) {
      try {
        if (action.type === "wait" && typeof action.hours === "number") {
          continue;
        }

        await executeAction(action, {
          ...context,
          workspaceId: automation.workspace_id,
        });

        actionsExecuted.push({ type: action.type, success: true });
      } catch (err) {
        actionsExecuted.push({
          type: action.type,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const hasFailures = actionsExecuted.some((a) => !a.success);
    const allFailed = actionsExecuted.length > 0 && actionsExecuted.every((a) => !a.success);

    return {
      status: allFailed ? "failed" : hasFailures ? "partial" : "success",
      actionsExecuted,
    };
  } catch (err) {
    return {
      status: "failed",
      actionsExecuted,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * High-level automation engine that finds and fires matching automations
 * for a given trigger event within a workspace.
 */
export class AutomationEngine {
  private workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  async trigger(
    triggerType: string,
    context: {
      contactId?: string;
      conversationId?: string;
      message?: Record<string, unknown>;
      isFirstMessage?: boolean;
    }
  ): Promise<void> {
    const db = supabaseAdmin();

    const { data: automations } = await db
      .from("automations")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .eq("is_active", true)
      .or(`trigger_type.eq.${triggerType},trigger_type.eq.keyword_match`);

    if (!automations || automations.length === 0) return;

    for (const automation of automations) {
      const shouldFire = this.shouldFireAutomation(automation, triggerType, context);

      if (!shouldFire) continue;

      try {
        const result = await executeAutomation(automation as unknown as Automation, {
          contactId: context.contactId,
          conversationId: context.conversationId,
          triggerData: {
            triggerType,
            ...context,
          },
        });

        await db
          .from("automations")
          .update({
            times_triggered: (automation.times_triggered ?? 0) + 1,
            last_triggered_at: new Date().toISOString(),
          })
          .eq("id", automation.id);

        await db.from("automation_logs").insert({
          workspace_id: this.workspaceId,
          automation_id: automation.id,
          contact_id: context.contactId ?? null,
          conversation_id: context.conversationId ?? null,
          trigger_data: { triggerType, ...context },
          actions_executed: result.actionsExecuted,
          status: result.status,
          error_message: result.error ?? null,
        });
      } catch (err) {
        console.error(`Automation ${automation.id} failed:`, err);
      }
    }
  }

  private shouldFireAutomation(
    automation: Record<string, unknown>,
    triggerType: string,
    context: {
      message?: Record<string, unknown>;
      isFirstMessage?: boolean;
    }
  ): boolean {
    if (automation.trigger_type === "new_conversation") {
      return context.isFirstMessage === true;
    }

    if (automation.trigger_type === "keyword_match" && triggerType === "new_message") {
      const config = automation.trigger_config as {
        keywords?: string[];
        match_type?: string;
      } | null;
      if (!config?.keywords?.length) return false;

      const messageText = (
        context.message as { text?: { body?: string } } | undefined
      )?.text?.body?.toLowerCase();
      if (!messageText) return false;

      const keywords = config.keywords.map((k) => k.toLowerCase());
      if (config.match_type === "all") {
        return keywords.every((kw) => messageText.includes(kw));
      }
      return keywords.some((kw) => messageText.includes(kw));
    }

    return automation.trigger_type === triggerType;
  }
}
