import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MetaAPIClient } from "@/lib/meta/api";
import { decryptToken } from "@/lib/utils/encryption";
import type { SupabaseClient } from "@supabase/supabase-js";

// GET: Meta webhook verification (called once during setup)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// POST: Handle all incoming WhatsApp events
export async function POST(req: NextRequest) {
  const body = await req.json();

  processWebhookAsync(body).catch((err) => {
    console.error("Webhook processing error:", err);
  });

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ── Async processing ───────────────────────────────────────

async function processWebhookAsync(body: WebhookBody) {
  const supabase = supabaseAdmin();

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const value = change.value;
      const phoneNumberId = value.metadata?.phone_number_id;

      const { data: connection } = await supabase
        .from("whatsapp_connections")
        .select("workspace_id, access_token, waba_id")
        .eq("phone_number_id", phoneNumberId)
        .eq("status", "active")
        .single();

      if (!connection) continue;

      const { workspace_id, access_token } = connection;
      const decryptedToken = decryptToken(access_token);
      const metaClient = new MetaAPIClient(decryptedToken, phoneNumberId);

      for (const message of value.messages ?? []) {
        await processIncomingMessage(
          supabase,
          metaClient,
          workspace_id,
          message,
          value.contacts?.[0]
        );
      }

      for (const status of value.statuses ?? []) {
        await processStatusUpdate(supabase, workspace_id, status);
      }
    }
  }
}

async function processIncomingMessage(
  supabase: SupabaseClient,
  metaClient: MetaAPIClient,
  workspaceId: string,
  message: WebhookMessage,
  contactInfo: WebhookContact | undefined
) {
  const waId = message.from;
  const profileName = contactInfo?.profile?.name;

  // Upsert contact — thread-safe with ON CONFLICT
  const { data: contact } = await supabase
    .from("contacts")
    .upsert(
      {
        workspace_id: workspaceId,
        wa_id: waId,
        profile_name: profileName || undefined,
        phone: `+${waId}`,
        last_message_at: new Date().toISOString(),
        status: "active",
        opted_in: true,
      },
      { onConflict: "workspace_id,wa_id", ignoreDuplicates: false }
    )
    .select(
      "id, status, first_message_at, assigned_agent_id, total_conversations, total_messages_received"
    )
    .single();

  if (!contact) return;

  if (!contact.first_message_at) {
    await supabase
      .from("contacts")
      .update({ first_message_at: new Date().toISOString() })
      .eq("id", contact.id);
  }

  // Find or create open conversation
  const conversation = await findOrCreateConversation(supabase, workspaceId, contact);

  if (!conversation) return;

  const windowExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await supabase
    .from("conversations")
    .update({
      customer_window_expires_at: windowExpiry.toISOString(),
      status: "open",
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  // Parse message content
  const parsed = extractMessageContent(message);

  // Insert message (idempotent — wa_message_id is UNIQUE)
  const { error } = await supabase
    .from("messages")
    .upsert(
      {
        workspace_id: workspaceId,
        conversation_id: conversation.id,
        contact_id: contact.id,
        wa_message_id: message.id,
        direction: "inbound",
        message_type: message.type,
        content: parsed.text ?? null,
        media_wa_id: parsed.mediaId ?? null,
        media_mime_type: parsed.mimeType ?? null,
        latitude: parsed.latitude ?? null,
        longitude: parsed.longitude ?? null,
        location_name: parsed.locationName ?? null,
        reply_to_wa_message_id: message.context?.id ?? null,
        reaction_emoji: parsed.reactionEmoji ?? null,
        reacted_to_wa_message_id: parsed.reactionTo ?? null,
        status: "received",
        created_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      },
      { onConflict: "wa_message_id", ignoreDuplicates: true }
    )
    .select("id")
    .single();

  if (error) return; // Already processed (duplicate webhook)

  // Update conversation preview and unread count
  await supabase
    .from("conversations")
    .update({
      last_message_preview: parsed.text?.slice(0, 100) || "[Media]",
      unread_count: (conversation.unread_count ?? 0) + 1,
    })
    .eq("id", conversation.id);

  // Update contact message count
  await supabase
    .from("contacts")
    .update({
      last_message_at: new Date().toISOString(),
      total_messages_received: (contact.total_messages_received ?? 0) + 1,
    })
    .eq("id", contact.id);

  // Mark message as read (shows blue ticks to customer)
  metaClient.markAsRead(message.id).catch(() => {});

  // Trigger automation engine (async, non-blocking)
  triggerAutomations(workspaceId, contact.id, conversation.id, message, contact.status).catch(
    (err) => console.error("Automation trigger error:", err)
  );
}

async function findOrCreateConversation(
  supabase: SupabaseClient,
  workspaceId: string,
  contact: {
    id: string;
    assigned_agent_id?: string | null;
    total_conversations?: number;
    total_messages_received?: number;
    status?: string;
  }
) {
  // Check for existing open conversation
  const { data: openConvo } = await supabase
    .from("conversations")
    .select("id, unread_count")
    .eq("workspace_id", workspaceId)
    .eq("contact_id", contact.id)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (openConvo) return openConvo;

  // Check for recently resolved/pending conversations to reopen
  const { data: recentConvo } = await supabase
    .from("conversations")
    .select("id, unread_count")
    .eq("workspace_id", workspaceId)
    .eq("contact_id", contact.id)
    .in("status", ["resolved", "pending"])
    .gte("last_message_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (recentConvo) return recentConvo;

  // Create new conversation
  const { data: newConvo } = await supabase
    .from("conversations")
    .insert({
      workspace_id: workspaceId,
      contact_id: contact.id,
      assigned_agent_id: contact.assigned_agent_id ?? null,
      status: "open",
      last_message_at: new Date().toISOString(),
      source: "inbound",
    })
    .select("id, unread_count")
    .single();

  if (newConvo) {
    await supabase
      .from("contacts")
      .update({
        total_conversations: (contact.total_conversations ?? 0) + 1,
      })
      .eq("id", contact.id);
  }

  return newConvo;
}

async function processStatusUpdate(
  supabase: SupabaseClient,
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

  await supabase
    .from("messages")
    .update(updateData)
    .eq("wa_message_id", status.id)
    .eq("workspace_id", workspaceId);
}

// ── Message content extraction ─────────────────────────────

interface ParsedContent {
  text?: string;
  mediaId?: string;
  mimeType?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  reactionEmoji?: string;
  reactionTo?: string;
}

function extractMessageContent(message: WebhookMessage): ParsedContent {
  switch (message.type) {
    case "text":
      return { text: message.text?.body };
    case "image":
      return {
        text: message.image?.caption,
        mediaId: message.image?.id,
        mimeType: message.image?.mime_type ?? "image/jpeg",
      };
    case "video":
      return {
        text: message.video?.caption,
        mediaId: message.video?.id,
        mimeType: message.video?.mime_type ?? "video/mp4",
      };
    case "audio":
      return {
        mediaId: message.audio?.id,
        mimeType: message.audio?.mime_type ?? "audio/ogg",
      };
    case "document":
      return {
        text: message.document?.caption,
        mediaId: message.document?.id,
        mimeType: message.document?.mime_type,
      };
    case "location":
      return {
        text: `📍 ${message.location?.name || "Location shared"}`,
        latitude: message.location?.latitude,
        longitude: message.location?.longitude,
        locationName: message.location?.name,
      };
    case "interactive": {
      const reply = message.interactive?.button_reply ?? message.interactive?.list_reply;
      return { text: reply?.title };
    }
    case "order":
      return { text: `🛒 Order received` };
    case "sticker":
      return { text: "🎭 [Sticker]", mediaId: message.sticker?.id };
    case "reaction":
      return {
        reactionEmoji: message.reaction?.emoji,
        reactionTo: message.reaction?.message_id,
      };
    default:
      return { text: `[${message.type}]` };
  }
}

// ── Automation trigger ─────────────────────────────────────

async function triggerAutomations(
  workspaceId: string,
  contactId: string,
  conversationId: string,
  message: WebhookMessage,
  contactStatus: string
) {
  const { AutomationEngine } = await import("@/lib/automations/engine");
  const engine = new AutomationEngine(workspaceId);

  await engine.trigger("new_message", {
    contactId,
    conversationId,
    message: message as unknown as Record<string, unknown>,
    isFirstMessage: contactStatus === "new",
  });
}

// ── Webhook payload types ──────────────────────────────────

interface WebhookBody {
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
        contacts?: WebhookContact[];
        messages?: WebhookMessage[];
        statuses?: WebhookStatus[];
      };
      field: string;
    }[];
  }[];
}

interface WebhookContact {
  profile: { name: string };
  wa_id: string;
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
  order?: Record<string, unknown>;
}

interface WebhookStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  errors?: { code: number; message: string }[];
}
