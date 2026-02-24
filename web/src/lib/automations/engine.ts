import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class AutomationEngine {
  private supabase: SupabaseClient;
  private workspaceId: string;

  constructor(supabase: SupabaseClient, workspaceId: string) {
    this.supabase = supabase;
    this.workspaceId = workspaceId;
  }

  async trigger(eventType: string, context: any) {
    const { data: automations } = await this.supabase
      .from("automations")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .eq("is_active", true)
      .eq("trigger_type", eventType);

    for (const automation of automations ?? []) {
      await this.evaluate(automation, context);
    }
  }

  async triggerByType(triggerTypes: string[]) {
    const { data: automations } = await this.supabase
      .from("automations")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .eq("is_active", true)
      .in("trigger_type", triggerTypes);

    for (const automation of automations ?? []) {
      await this.evaluateBatch(automation);
    }
  }

  // ── Core evaluation ──────────────────────────────────────

  private async evaluate(automation: any, context: any) {
    try {
      if (context.contactId) {
        const { data: recentLog } = await this.supabase
          .from("automation_logs")
          .select("triggered_at")
          .eq("automation_id", automation.id)
          .eq("contact_id", context.contactId)
          .order("triggered_at", { ascending: false })
          .limit(1)
          .single();

        if (recentLog) {
          const hoursSince = (Date.now() - new Date(recentLog.triggered_at).getTime()) / 3_600_000;
          if (hoursSince < automation.cooldown_hours) return;
        }

        const { count } = await this.supabase
          .from("automation_logs")
          .select("id", { count: "exact", head: true })
          .eq("automation_id", automation.id)
          .eq("contact_id", context.contactId);

        if ((count ?? 0) >= automation.max_triggers_per_contact) return;
      }

      const conditionsMet = await this.evaluateConditions(automation.conditions, context);
      if (!conditionsMet) return;

      const actionsExecuted = await this.executeActions(automation.actions, context);

      await this.supabase.from("automation_logs").insert({
        workspace_id: this.workspaceId,
        automation_id: automation.id,
        contact_id: context.contactId ?? null,
        conversation_id: context.conversationId ?? null,
        triggered_at: new Date().toISOString(),
        trigger_data: context,
        actions_executed: actionsExecuted,
        status: "success",
      });

      await this.supabase
        .from("automations")
        .update({
          times_triggered: (automation.times_triggered ?? 0) + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq("id", automation.id);
    } catch (error: any) {
      console.error(`Automation ${automation.id} failed:`, error);
      await this.supabase.from("automation_logs").insert({
        workspace_id: this.workspaceId,
        automation_id: automation.id,
        contact_id: context.contactId ?? null,
        triggered_at: new Date().toISOString(),
        trigger_data: context,
        status: "failed",
        error_message: error.message,
      });
    }
  }

  // ── Conditions ───────────────────────────────────────────

  private async evaluateConditions(conditions: any[], context: any): Promise<boolean> {
    if (!conditions || conditions.length === 0) return true;

    const { data: contact } = context.contactId
      ? await this.supabase.from("contacts").select("*").eq("id", context.contactId).single()
      : { data: null };

    for (const condition of conditions) {
      const value = this.resolveField(condition.field, contact, context);
      if (!this.evaluateCondition(value, condition.operator, condition.value)) return false;
    }

    return true;
  }

  private resolveField(field: string, contact: any, context: any): any {
    const parts = field.split(".");
    if (parts[0] === "contact") return contact?.[parts[1]];
    if (parts[0] === "message") return context.message?.[parts[1]];
    if (parts[0] === "custom") return contact?.custom_fields?.[parts[1]];
    return null;
  }

  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case "equals":
        return value === expected;
      case "not_equals":
        return value !== expected;
      case "contains":
        return String(value ?? "")
          .toLowerCase()
          .includes(String(expected).toLowerCase());
      case "not_contains":
        return !String(value ?? "")
          .toLowerCase()
          .includes(String(expected).toLowerCase());
      case "in":
        return Array.isArray(expected) ? expected.includes(value) : false;
      case "not_in":
        return Array.isArray(expected) ? !expected.includes(value) : true;
      case "greater_than":
        return Number(value) > Number(expected);
      case "less_than":
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

  // ── Actions ──────────────────────────────────────────────

  private async executeActions(actions: any[], context: any): Promise<any[]> {
    const executed = [];

    for (const action of actions) {
      try {
        if (action.type === "wait") {
          executed.push({
            type: "wait",
            result: { hours: action.hours },
            success: true,
          });
          continue;
        }

        const result = await this.executeAction(action, context);
        executed.push({ type: action.type, result, success: true });
      } catch (err: any) {
        executed.push({
          type: action.type,
          error: err.message,
          success: false,
        });
      }
    }

    return executed;
  }

  private async executeAction(action: any, context: any): Promise<any> {
    const { data: contact } = context.contactId
      ? await this.supabase.from("contacts").select("*").eq("id", context.contactId).single()
      : { data: null };

    const { data: connection } = await this.supabase
      .from("whatsapp_connections")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .single();

    switch (action.type) {
      case "send_template": {
        const { data: template } = await this.supabase
          .from("templates")
          .select("*")
          .eq("id", action.template_id)
          .single();

        if (!template || template.meta_template_status !== "approved") {
          throw new Error(`Template ${action.template_id} is not approved`);
        }

        const resolvedVariables = await this.resolveTemplateVariables(
          action.variables,
          contact,
          context
        );

        const { decryptToken } = await import("@/lib/utils/encryption");
        const { MetaAPIClient } = await import("@/lib/meta/api");
        const client = new MetaAPIClient(
          decryptToken(connection.access_token),
          connection.phone_number_id
        );

        return client.sendTemplate(
          contact.wa_id,
          template.meta_template_name,
          template.language,
          this.buildTemplateComponents(template, resolvedVariables)
        );
      }

      case "send_message": {
        const resolvedMessage = this.interpolateVariables(action.message, contact, context);
        const { decryptToken } = await import("@/lib/utils/encryption");
        const { MetaAPIClient } = await import("@/lib/meta/api");
        const client = new MetaAPIClient(
          decryptToken(connection.access_token),
          connection.phone_number_id
        );
        return client.sendText(contact.wa_id, resolvedMessage);
      }

      case "assign_agent": {
        let agentId = action.agent_id;
        if (agentId === "round_robin") {
          agentId = await this.getRoundRobinAgent();
        } else if (agentId === "least_busy") {
          agentId = await this.getLeastBusyAgent();
        }

        if (agentId) {
          if (context.conversationId) {
            await this.supabase
              .from("conversations")
              .update({ assigned_agent_id: agentId })
              .eq("id", context.conversationId);
          }
          if (context.contactId) {
            await this.supabase
              .from("contacts")
              .update({ assigned_agent_id: agentId })
              .eq("id", context.contactId);
          }
        }
        return { agentId };
      }

      case "add_tag": {
        if (!context.contactId || !action.tags?.length) break;
        const existing = contact?.tags ?? [];
        const merged = [...new Set([...existing, ...action.tags])];
        await this.supabase.from("contacts").update({ tags: merged }).eq("id", context.contactId);
        return { tags: action.tags };
      }

      case "remove_tag": {
        if (!context.contactId || !action.tags?.length) break;
        const existing = contact?.tags ?? [];
        const filtered = existing.filter((t: string) => !action.tags.includes(t));
        await this.supabase.from("contacts").update({ tags: filtered }).eq("id", context.contactId);
        return { tags: action.tags };
      }

      case "update_status": {
        if (!context.contactId) break;
        await this.supabase
          .from("contacts")
          .update({ status: action.status })
          .eq("id", context.contactId);
        return { status: action.status };
      }

      case "update_lifecycle": {
        if (!context.contactId) break;
        await this.supabase
          .from("contacts")
          .update({ lifecycle_stage: action.stage })
          .eq("id", context.contactId);
        return { stage: action.stage };
      }

      case "update_custom_field": {
        if (!context.contactId || !action.field) break;
        const customFields = contact?.custom_fields ?? {};
        const updated = { ...customFields, [action.field]: action.value };
        await this.supabase
          .from("contacts")
          .update({ custom_fields: updated })
          .eq("id", context.contactId);
        return { field: action.field, value: action.value };
      }

      case "resolve_conversation": {
        if (!context.conversationId) break;
        await this.supabase
          .from("conversations")
          .update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
          })
          .eq("id", context.conversationId);
        return {};
      }

      case "snooze_conversation": {
        if (!context.conversationId) break;
        const snoozeUntil = new Date(Date.now() + (action.hours ?? 24) * 3_600_000);
        await this.supabase
          .from("conversations")
          .update({
            status: "snoozed",
            snoozed_until: snoozeUntil.toISOString(),
          })
          .eq("id", context.conversationId);
        return { snoozed_until: snoozeUntil };
      }

      case "send_webhook": {
        const payload = this.interpolateObject(action.payload ?? {}, contact, context);
        await fetch(action.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(action.headers ?? {}),
          },
          body: JSON.stringify(payload),
        });
        return { url: action.url };
      }

      case "notify_agent": {
        await this.supabase.from("notifications").insert({
          workspace_id: this.workspaceId,
          agent_id: action.agent_id,
          type: "automation_error",
          title: action.title || "Automation alert",
          body: this.interpolateVariables(action.message ?? "", contact, context),
          conversation_id: context.conversationId ?? null,
          contact_id: context.contactId ?? null,
        });
        return {};
      }

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    return {};
  }

  // ── Variable interpolation ───────────────────────────────

  private interpolateVariables(template: string, contact: any, context: any): string {
    if (!template) return "";
    return template
      .replace(/\{\{contact\.(\w+)\}\}/g, (_, field) => contact?.[field] ?? "")
      .replace(
        /\{\{contact\.custom\.(\w+)\}\}/g,
        (_, field) => contact?.custom_fields?.[field] ?? ""
      )
      .replace(/\{\{workspace\.name\}\}/g, context.workspaceName ?? "")
      .replace(/\{\{message\.text\}\}/g, context.message?.text?.body ?? context.message?.text ?? "")
      .replace(/\{\{date\.today\}\}/g, new Date().toLocaleDateString("en-IN"));
  }

  private interpolateObject(obj: any, contact: any, context: any): any {
    if (!obj) return {};
    const str = JSON.stringify(obj);
    return JSON.parse(this.interpolateVariables(str, contact, context));
  }

  // ── Template helpers ─────────────────────────────────────

  private async resolveTemplateVariables(variableMapping: any, contact: any, context: any) {
    const resolved: Record<string, string> = {};
    for (const [index, source] of Object.entries(variableMapping ?? {})) {
      resolved[index] = this.interpolateVariables(source as string, contact, context);
    }
    return resolved;
  }

  private buildTemplateComponents(template: any, variables: Record<string, string>) {
    const components: Record<string, unknown>[] = [];

    if (template.header_type === "TEXT" && template.header_text) {
      components.push({
        type: "header",
        parameters: [{ type: "text", text: template.header_text }],
      });
    } else if (["IMAGE", "VIDEO", "DOCUMENT"].includes(template.header_type)) {
      const mediaType = template.header_type.toLowerCase();
      components.push({
        type: "header",
        parameters: [{ type: mediaType, [mediaType]: { link: template.header_media_url } }],
      });
    }

    const variableValues = Object.values(variables);
    if (variableValues.length > 0) {
      components.push({
        type: "body",
        parameters: variableValues.map((v) => ({ type: "text", text: v })),
      });
    }

    return components;
  }

  // ── Agent assignment ─────────────────────────────────────

  private async getRoundRobinAgent(): Promise<string | null> {
    const { data: agents } = await this.supabase
      .from("agents")
      .select("id")
      .eq("workspace_id", this.workspaceId)
      .eq("is_active", true)
      .neq("role", "readonly");

    if (!agents?.length) return null;

    const { data: conversations } = await this.supabase
      .from("conversations")
      .select("assigned_agent_id")
      .eq("workspace_id", this.workspaceId)
      .eq("status", "open")
      .not("assigned_agent_id", "is", null);

    const counts: Record<string, number> = {};
    for (const agent of agents) counts[agent.id] = 0;
    for (const c of conversations ?? []) {
      if (c.assigned_agent_id && counts[c.assigned_agent_id] !== undefined) {
        counts[c.assigned_agent_id]++;
      }
    }

    const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
    return sorted[0]?.[0] ?? agents[0].id;
  }

  private async getLeastBusyAgent(): Promise<string | null> {
    return this.getRoundRobinAgent();
  }

  // ── Batch evaluation (for cron-triggered automations) ────

  private async evaluateBatch(_automation: any) {
    // For time_based and inactivity triggers — finds contacts matching criteria
    // and fires the automation for each one. Implementation deferred to
    // the pg_cron job that calls /api/automations/execute.
  }
}

/**
 * Standalone helper kept for backward compatibility with the
 * /api/automations/execute route. Delegates to AutomationEngine.
 */
export async function executeAutomation(
  automation: any,
  context: {
    contactId?: string;
    conversationId?: string;
    triggerData?: Record<string, unknown>;
  }
): Promise<{
  status: "success" | "partial" | "failed";
  actionsExecuted: { type: string; success: boolean; error?: string }[];
  error?: string;
}> {
  const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
  const db = supabaseAdmin();
  const engine = new AutomationEngine(db, automation.workspace_id);

  try {
    // Use the engine's internal evaluate, which handles cooldown,
    // conditions, and action execution.
    // We re-implement a thin wrapper here for the route's interface.
    const actionsExecuted: {
      type: string;
      success: boolean;
      error?: string;
    }[] = [];

    const conditionsMet = await (engine as any).evaluateConditions(
      automation.conditions ?? [],
      context
    );
    if (!conditionsMet) {
      return { status: "success", actionsExecuted: [] };
    }

    const results = await (engine as any).executeActions(automation.actions ?? [], context);

    for (const r of results) {
      actionsExecuted.push({
        type: r.type,
        success: r.success,
        error: r.error,
      });
    }

    const hasFailures = actionsExecuted.some((a) => !a.success);
    const allFailed = actionsExecuted.length > 0 && actionsExecuted.every((a) => !a.success);

    return {
      status: allFailed ? "failed" : hasFailures ? "partial" : "success",
      actionsExecuted,
    };
  } catch (err: any) {
    return {
      status: "failed",
      actionsExecuted: [],
      error: err.message,
    };
  }
}
