import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AutomationCondition } from "@/types";

interface ConditionContext {
  contactId?: string;
  conversationId?: string;
  triggerData?: Record<string, unknown>;
}

/**
 * Standalone condition evaluator. Used by the execute API route.
 * The AutomationEngine class has its own internal evaluator
 * with richer field resolution (contact.*, message.*, custom.*).
 */
export async function evaluateConditions(
  conditions: AutomationCondition[],
  context: ConditionContext
): Promise<boolean> {
  if (!conditions || conditions.length === 0) return true;

  const db = supabaseAdmin();

  let contact: Record<string, unknown> | null = null;
  if (context.contactId) {
    const { data } = await db.from("contacts").select("*").eq("id", context.contactId).single();
    contact = data;
  }

  for (const condition of conditions) {
    const value = resolveField(contact, context.triggerData, condition.field);
    if (!evaluate(value, condition.operator, condition.value)) return false;
  }

  return true;
}

function resolveField(
  contact: Record<string, unknown> | null,
  triggerData: Record<string, unknown> | undefined,
  field: string
): unknown {
  const parts = field.split(".");
  if (parts[0] === "contact") return contact?.[parts[1]];
  if (parts[0] === "trigger" && triggerData) return triggerData[parts[1]];
  if (parts[0] === "custom" && contact?.custom_fields) {
    return (contact.custom_fields as Record<string, unknown>)[parts[1]];
  }
  if (field.startsWith("custom_fields.") && contact?.custom_fields) {
    return (contact.custom_fields as Record<string, unknown>)[field.replace("custom_fields.", "")];
  }
  return contact?.[field] ?? null;
}

function evaluate(value: unknown, operator: string, expected: string | number | boolean): boolean {
  switch (operator) {
    case "equals":
      return value === expected;
    case "not_equals":
      return value !== expected;
    case "contains":
      if (Array.isArray(value)) return value.includes(expected);
      return String(value ?? "")
        .toLowerCase()
        .includes(String(expected).toLowerCase());
    case "not_contains":
      if (Array.isArray(value)) return !value.includes(expected);
      return !String(value ?? "")
        .toLowerCase()
        .includes(String(expected).toLowerCase());
    case "in":
      return Array.isArray(expected) ? (expected as unknown[]).includes(value) : false;
    case "not_in":
      return Array.isArray(expected) ? !(expected as unknown[]).includes(value) : true;
    case "greater_than":
    case "gt":
      return Number(value) > Number(expected);
    case "less_than":
    case "lt":
      return Number(value) < Number(expected);
    case "is_empty":
      return !value || value === "";
    case "is_not_empty":
      return !!value && value !== "";
    case "array_contains":
      return Array.isArray(value) ? value.includes(expected) : false;
    default:
      return true;
  }
}
