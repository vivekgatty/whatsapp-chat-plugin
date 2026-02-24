import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AutomationCondition } from "@/types";

interface ConditionContext {
  contactId?: string;
  conversationId?: string;
  triggerData?: Record<string, unknown>;
}

export async function evaluateConditions(
  conditions: AutomationCondition[],
  context: ConditionContext
): Promise<boolean> {
  if (conditions.length === 0) return true;

  const db = supabaseAdmin();

  let contact: Record<string, unknown> | null = null;
  if (context.contactId) {
    const { data } = await db.from("contacts").select("*").eq("id", context.contactId).single();
    contact = data;
  }

  for (const condition of conditions) {
    const fieldValue = getFieldValue(contact, context.triggerData, condition.field);
    const matched = evaluateOperator(fieldValue, condition.operator, condition.value);
    if (!matched) return false;
  }

  return true;
}

function getFieldValue(
  contact: Record<string, unknown> | null,
  triggerData: Record<string, unknown> | undefined,
  field: string
): unknown {
  if (field.startsWith("trigger.") && triggerData) {
    return triggerData[field.replace("trigger.", "")];
  }
  if (field.startsWith("custom_fields.") && contact?.custom_fields) {
    const customFields = contact.custom_fields as Record<string, unknown>;
    return customFields[field.replace("custom_fields.", "")];
  }
  return contact?.[field] ?? null;
}

function evaluateOperator(
  fieldValue: unknown,
  operator: string,
  conditionValue: string | number | boolean
): boolean {
  switch (operator) {
    case "equals":
      return fieldValue === conditionValue;
    case "not_equals":
      return fieldValue !== conditionValue;
    case "contains":
      if (Array.isArray(fieldValue)) return fieldValue.includes(conditionValue);
      return String(fieldValue).includes(String(conditionValue));
    case "not_contains":
      if (Array.isArray(fieldValue)) return !fieldValue.includes(conditionValue);
      return !String(fieldValue).includes(String(conditionValue));
    case "gt":
      return Number(fieldValue) > Number(conditionValue);
    case "lt":
      return Number(fieldValue) < Number(conditionValue);
    default:
      return false;
  }
}
