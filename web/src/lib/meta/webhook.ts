import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface WebhookPayload {
  object: string;
  entry?: WebhookEntry[];
}

interface WebhookEntry {
  id: string;
  changes?: WebhookChange[];
}

interface WebhookChange {
  value: {
    messaging_product: string;
    metadata: { display_phone_number: string; phone_number_id: string };
    contacts?: { profile: { name: string }; wa_id: string }[];
    messages?: WebhookMessage[];
    statuses?: WebhookStatus[];
  };
  field: string;
}

interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; mime_type: string; filename?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  reaction?: { message_id: string; emoji: string };
}

interface WebhookStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

export async function processWebhookPayload(payload: WebhookPayload): Promise<void> {
  if (payload.object !== "whatsapp_business_account") return;

  const db = supabaseAdmin();

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const { metadata, contacts, messages, statuses } = change.value;
      const phoneNumberId = metadata.phone_number_id;

      const { data: connection } = await db
        .from("whatsapp_connections")
        .select("workspace_id")
        .eq("phone_number_id", phoneNumberId)
        .single();

      if (!connection) continue;
      const workspaceId = connection.workspace_id;

      if (messages) {
        for (const msg of messages) {
          const waId = msg.from;
          const profileName = contacts?.[0]?.profile?.name ?? null;

          const { data: contact } = await db
            .from("contacts")
            .upsert(
              {
                workspace_id: workspaceId,
                wa_id: waId,
                profile_name: profileName,
                last_message_at: new Date().toISOString(),
              },
              { onConflict: "workspace_id,wa_id" }
            )
            .select("id")
            .single();

          if (!contact) continue;

          const { data: conversation } = await db
            .from("conversations")
            .upsert(
              {
                workspace_id: workspaceId,
                contact_id: contact.id,
                status: "open",
                last_message_at: new Date().toISOString(),
                last_message_preview: msg.text?.body?.slice(0, 100) ?? `[${msg.type}]`,
                customer_window_expires_at: new Date(
                  Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(),
              },
              { onConflict: "workspace_id,contact_id" }
            )
            .select("id")
            .single();

          if (!conversation) continue;

          await db.from("messages").insert({
            workspace_id: workspaceId,
            conversation_id: conversation.id,
            contact_id: contact.id,
            direction: "inbound",
            wa_message_id: msg.id,
            message_type: msg.type,
            content: msg.text?.body ?? null,
            caption: msg.image?.caption ?? null,
            media_wa_id: msg.image?.id ?? msg.document?.id ?? null,
            media_mime_type: msg.image?.mime_type ?? msg.document?.mime_type ?? null,
            media_filename: msg.document?.filename ?? null,
            latitude: msg.location?.latitude ?? null,
            longitude: msg.location?.longitude ?? null,
            location_name: msg.location?.name ?? null,
            location_address: msg.location?.address ?? null,
            reaction_emoji: msg.reaction?.emoji ?? null,
            reacted_to_wa_message_id: msg.reaction?.message_id ?? null,
            status: "delivered",
          });
        }
      }

      if (statuses) {
        for (const status of statuses) {
          await db
            .from("messages")
            .update({
              status: status.status,
              status_updated_at: new Date(Number(status.timestamp) * 1000).toISOString(),
            })
            .eq("wa_message_id", status.id);
        }
      }
    }
  }
}
