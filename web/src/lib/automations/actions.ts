import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTextMessage, sendTemplateMessage } from "@/lib/meta/api";
import type { AutomationAction } from "@/types";

interface ActionContext {
  workspaceId: string;
  contactId?: string;
  conversationId?: string;
  triggerData?: Record<string, unknown>;
}

export async function executeAction(
  action: AutomationAction,
  context: ActionContext
): Promise<void> {
  const db = supabaseAdmin();

  switch (action.type) {
    case "send_message": {
      const message = action.message as string | undefined;
      if (!message || !context.contactId) break;

      const { data: connection } = await db
        .from("whatsapp_connections")
        .select("phone_number_id, access_token")
        .eq("workspace_id", context.workspaceId)
        .single();

      const { data: contact } = await db
        .from("contacts")
        .select("wa_id")
        .eq("id", context.contactId)
        .single();

      if (connection && contact) {
        await sendTextMessage(
          connection.phone_number_id,
          connection.access_token,
          contact.wa_id,
          message
        );
      }
      break;
    }

    case "send_template": {
      const templateId = action.template_id as string | undefined;
      const variables = action.variables as Record<string, string> | undefined;
      if (!templateId || !context.contactId) break;

      const { data: template } = await db
        .from("templates")
        .select("meta_template_name, language")
        .eq("id", templateId)
        .single();

      const { data: connection } = await db
        .from("whatsapp_connections")
        .select("phone_number_id, access_token")
        .eq("workspace_id", context.workspaceId)
        .single();

      const { data: contact } = await db
        .from("contacts")
        .select("wa_id")
        .eq("id", context.contactId)
        .single();

      if (template && connection && contact) {
        await sendTemplateMessage(
          connection.phone_number_id,
          connection.access_token,
          contact.wa_id,
          template.meta_template_name,
          template.language,
          Object.values(variables ?? {})
        );
      }
      break;
    }

    case "assign_agent": {
      const agentId = action.agent_id as string | undefined;
      if (!context.conversationId) break;

      if (agentId === "round_robin" || agentId === "least_busy") {
        const { data: agents } = await db
          .from("agents")
          .select("id")
          .eq("workspace_id", context.workspaceId)
          .eq("is_active", true)
          .eq("is_online", true)
          .limit(1);

        if (agents?.[0]) {
          await db
            .from("conversations")
            .update({ assigned_agent_id: agents[0].id })
            .eq("id", context.conversationId);
        }
      } else if (agentId) {
        await db
          .from("conversations")
          .update({ assigned_agent_id: agentId })
          .eq("id", context.conversationId);
      }
      break;
    }

    case "add_tag": {
      const tags = action.tags as string[] | undefined;
      if (!tags || !context.contactId) break;
      const { data: contact } = await db
        .from("contacts")
        .select("tags")
        .eq("id", context.contactId)
        .single();
      if (contact) {
        const merged = [...new Set([...(contact.tags ?? []), ...tags])];
        await db.from("contacts").update({ tags: merged }).eq("id", context.contactId);
      }
      break;
    }

    case "remove_tag": {
      const tags = action.tags as string[] | undefined;
      if (!tags || !context.contactId) break;
      const { data: contact } = await db
        .from("contacts")
        .select("tags")
        .eq("id", context.contactId)
        .single();
      if (contact) {
        const filtered = (contact.tags ?? []).filter((t: string) => !tags.includes(t));
        await db.from("contacts").update({ tags: filtered }).eq("id", context.contactId);
      }
      break;
    }

    case "update_status": {
      const status = action.status as string | undefined;
      if (!status || !context.contactId) break;
      await db.from("contacts").update({ status }).eq("id", context.contactId);
      break;
    }

    case "update_lifecycle": {
      const stage = action.stage as string | undefined;
      if (!stage || !context.contactId) break;
      await db.from("contacts").update({ lifecycle_stage: stage }).eq("id", context.contactId);
      break;
    }

    case "resolve_conversation": {
      if (!context.conversationId) break;
      await db
        .from("conversations")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", context.conversationId);
      break;
    }

    case "snooze_conversation": {
      const hours = action.hours as number | undefined;
      if (!hours || !context.conversationId) break;
      await db
        .from("conversations")
        .update({
          status: "snoozed",
          snoozed_until: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", context.conversationId);
      break;
    }

    case "send_webhook": {
      const url = action.url as string | undefined;
      const payload = action.payload as Record<string, unknown> | undefined;
      if (!url) break;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...context }),
      });
      break;
    }

    case "update_custom_field": {
      const field = action.field as string | undefined;
      const value = action.value;
      if (!field || !context.contactId) break;
      const { data: contact } = await db
        .from("contacts")
        .select("custom_fields")
        .eq("id", context.contactId)
        .single();
      if (contact) {
        const fields = {
          ...(contact.custom_fields as Record<string, unknown>),
          [field]: value,
        };
        await db.from("contacts").update({ custom_fields: fields }).eq("id", context.contactId);
      }
      break;
    }
  }
}
