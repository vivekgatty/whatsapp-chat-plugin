/**
 * Webhook payload processing utilities.
 *
 * The primary processing logic now lives in
 * app/api/whatsapp/webhook/route.ts (processWebhookAsync).
 *
 * This module is kept for backward compatibility and provides
 * a standalone processWebhookPayload() that can be called from
 * tests or other entry points (e.g. Supabase Edge Functions).
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MetaAPIClient } from "@/lib/meta/api";
import { decryptToken } from "@/lib/utils/encryption";

interface WebhookPayload {
  object: string;
  entry?: {
    id: string;
    changes?: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: { profile: { name: string }; wa_id: string }[];
        messages?: WebhookMessage[];
        statuses?: WebhookStatus[];
      };
      field: string;
    }[];
  }[];
}

interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  context?: { id: string };
  text?: { body: string };
  image?: { id: string; mime_type?: string; caption?: string };
  video?: { id: string; mime_type?: string; caption?: string };
  audio?: { id: string; mime_type?: string };
  document?: {
    id: string;
    mime_type?: string;
    filename?: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  interactive?: {
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
  sticker?: { id: string };
  reaction?: { message_id: string; emoji: string };
}

interface WebhookStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  errors?: { code: number; message: string }[];
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
        .select("workspace_id, access_token")
        .eq("phone_number_id", phoneNumberId)
        .eq("status", "active")
        .single();

      if (!connection) continue;

      const workspaceId = connection.workspace_id;
      const decryptedToken = decryptToken(connection.access_token);
      const metaClient = new MetaAPIClient(decryptedToken, phoneNumberId);

      if (messages) {
        for (const msg of messages) {
          await processMessage(db, metaClient, workspaceId, msg, contacts?.[0]);
        }
      }

      if (statuses) {
        for (const status of statuses) {
          await processStatus(db, workspaceId, status);
        }
      }
    }
  }
}

async function processMessage(
  db: ReturnType<typeof supabaseAdmin>,
  metaClient: MetaAPIClient,
  workspaceId: string,
  msg: WebhookMessage,
  contactInfo?: { profile: { name: string }; wa_id: string }
) {
  const waId = msg.from;
  const profileName = contactInfo?.profile?.name ?? null;

  const { data: contact } = await db
    .from("contacts")
    .upsert(
      {
        workspace_id: workspaceId,
        wa_id: waId,
        profile_name: profileName,
        phone: `+${waId}`,
        last_message_at: new Date().toISOString(),
        status: "active",
        opted_in: true,
      },
      { onConflict: "workspace_id,wa_id" }
    )
    .select("id, assigned_agent_id")
    .single();

  if (!contact) return;

  let { data: conversation } = await db
    .from("conversations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("contact_id", contact.id)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const windowExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  if (!conversation) {
    const { data: newConvo } = await db
      .from("conversations")
      .insert({
        workspace_id: workspaceId,
        contact_id: contact.id,
        assigned_agent_id: contact.assigned_agent_id,
        status: "open",
        customer_window_expires_at: windowExpiry,
        last_message_at: new Date().toISOString(),
        source: "inbound",
      })
      .select("id")
      .single();
    conversation = newConvo;
  } else {
    await db
      .from("conversations")
      .update({
        customer_window_expires_at: windowExpiry,
        status: "open",
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);
  }

  if (!conversation) return;

  const content = extractContent(msg);

  await db.from("messages").upsert(
    {
      workspace_id: workspaceId,
      conversation_id: conversation.id,
      contact_id: contact.id,
      direction: "inbound",
      wa_message_id: msg.id,
      message_type: msg.type,
      content: content.text ?? null,
      media_wa_id: content.mediaId ?? null,
      media_mime_type: content.mimeType ?? null,
      latitude: content.latitude ?? null,
      longitude: content.longitude ?? null,
      location_name: content.locationName ?? null,
      reply_to_wa_message_id: msg.context?.id ?? null,
      reaction_emoji: content.reactionEmoji ?? null,
      reacted_to_wa_message_id: content.reactionTo ?? null,
      status: "received",
      created_at: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
    },
    { onConflict: "wa_message_id", ignoreDuplicates: true }
  );

  await db
    .from("conversations")
    .update({
      last_message_preview: content.text?.slice(0, 100) || "[Media]",
    })
    .eq("id", conversation.id);

  metaClient.markAsRead(msg.id).catch(() => {});
}

async function processStatus(
  db: ReturnType<typeof supabaseAdmin>,
  workspaceId: string,
  status: WebhookStatus
) {
  const updateData: Record<string, unknown> = {
    status: status.status,
    status_updated_at: new Date(parseInt(status.timestamp) * 1000).toISOString(),
  };

  if (status.errors?.length) {
    updateData.error_code = status.errors[0].code?.toString();
    updateData.error_message = status.errors[0].message;
  }

  await db
    .from("messages")
    .update(updateData)
    .eq("wa_message_id", status.id)
    .eq("workspace_id", workspaceId);
}

function extractContent(msg: WebhookMessage) {
  switch (msg.type) {
    case "text":
      return { text: msg.text?.body };
    case "image":
      return {
        text: msg.image?.caption,
        mediaId: msg.image?.id,
        mimeType: msg.image?.mime_type ?? "image/jpeg",
      };
    case "video":
      return {
        text: msg.video?.caption,
        mediaId: msg.video?.id,
        mimeType: msg.video?.mime_type ?? "video/mp4",
      };
    case "audio":
      return {
        mediaId: msg.audio?.id,
        mimeType: msg.audio?.mime_type ?? "audio/ogg",
      };
    case "document":
      return {
        text: msg.document?.caption,
        mediaId: msg.document?.id,
        mimeType: msg.document?.mime_type,
      };
    case "location":
      return {
        text: `📍 ${msg.location?.name || "Location shared"}`,
        latitude: msg.location?.latitude,
        longitude: msg.location?.longitude,
        locationName: msg.location?.name,
      };
    case "sticker":
      return { text: "🎭 [Sticker]", mediaId: msg.sticker?.id };
    case "reaction":
      return {
        reactionEmoji: msg.reaction?.emoji,
        reactionTo: msg.reaction?.message_id,
      };
    default:
      return { text: `[${msg.type}]` };
  }
}
