import type { SupabaseClient } from "@supabase/supabase-js";
import { getConversationLimit } from "./plans";

export type UsageLevel = "ok" | "warning" | "soft_limit" | "hard_limit";

export interface UsageStatus {
  used: number;
  limit: number;
  percentage: number;
  level: UsageLevel;
  canSendOutbound: boolean;
}

/**
 * Evaluate conversation usage for a workspace.
 *
 * - ok: <80% used
 * - warning: 80-99% used — show upgrade prompt
 * - soft_limit: 100-119% — warning banner, conversations still work
 * - hard_limit: >=120% — outbound templates blocked, inbound still open
 *
 * NEVER block incoming messages.
 */
export function evaluateUsage(used: number, planTier: string): UsageStatus {
  const limit = getConversationLimit(planTier);

  if (limit === Infinity) {
    return {
      used,
      limit,
      percentage: 0,
      level: "ok",
      canSendOutbound: true,
    };
  }

  const percentage = (used / limit) * 100;

  let level: UsageLevel;
  if (percentage >= 120) level = "hard_limit";
  else if (percentage >= 100) level = "soft_limit";
  else if (percentage >= 80) level = "warning";
  else level = "ok";

  return {
    used,
    limit,
    percentage,
    level,
    canSendOutbound: level !== "hard_limit",
  };
}

/**
 * Checks usage and increments the counter atomically.
 * Returns whether the outbound message should be allowed.
 *
 * Call this before sending any outbound template/message.
 * Inbound messages should NEVER be blocked.
 */
export async function checkAndIncrementUsage(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<{ allowed: boolean; usage: UsageStatus }> {
  const { data: ws } = await supabase
    .from("workspaces")
    .select("plan, conversations_used_this_month, monthly_conversation_limit")
    .eq("id", workspaceId)
    .single();

  if (!ws) {
    return {
      allowed: false,
      usage: {
        used: 0,
        limit: 0,
        percentage: 0,
        level: "hard_limit",
        canSendOutbound: false,
      },
    };
  }

  const usage = evaluateUsage(ws.conversations_used_this_month ?? 0, ws.plan ?? "trial");

  if (!usage.canSendOutbound) {
    return { allowed: false, usage };
  }

  await supabase
    .from("workspaces")
    .update({
      conversations_used_this_month: (ws.conversations_used_this_month ?? 0) + 1,
    })
    .eq("id", workspaceId);

  return { allowed: true, usage };
}

/**
 * Increment conversation count for inbound messages.
 * Always succeeds — never blocks inbound.
 */
export async function incrementInboundUsage(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<void> {
  const { data: ws } = await supabase
    .from("workspaces")
    .select("conversations_used_this_month")
    .eq("id", workspaceId)
    .single();

  await supabase
    .from("workspaces")
    .update({
      conversations_used_this_month: (ws?.conversations_used_this_month ?? 0) + 1,
    })
    .eq("id", workspaceId);
}

/**
 * Get trial days remaining. Returns null if not on trial.
 */
export function getTrialDaysRemaining(
  subscriptionStatus: string | null,
  trialEndsAt: string | null
): number | null {
  if (subscriptionStatus !== "trialing" || !trialEndsAt) return null;
  const remaining = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 86_400_000));
}
