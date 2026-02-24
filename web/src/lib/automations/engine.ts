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
          // In a real implementation, this would schedule a delayed job
          continue;
        }

        await executeAction(action, {
          ...context,
          workspaceId: automation.workspace_id,
        });

        actionsExecuted.push({
          type: action.type,
          success: true,
        });
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
