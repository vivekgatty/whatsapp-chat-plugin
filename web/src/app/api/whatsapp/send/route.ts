import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MetaAPIClient } from "@/lib/meta/api";
import { decryptToken } from "@/lib/utils/encryption";
import { checkAndIncrementUsage } from "@/lib/billing/usage";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, phone, message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const { data: agent } = await supabase
      .from("agents")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("phone_number_id, access_token")
      .eq("workspace_id", agent.workspace_id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "WhatsApp not connected" }, { status: 400 });
    }

    let recipientPhone = phone;
    if (conversationId && !phone) {
      const { data: convo } = await supabase
        .from("conversations")
        .select("contacts(wa_id)")
        .eq("id", conversationId)
        .single();
      recipientPhone = (convo?.contacts as unknown as { wa_id: string } | null)?.wa_id;
    }

    if (!recipientPhone) {
      return NextResponse.json({ error: "No recipient phone number" }, { status: 400 });
    }

    const { allowed, usage } = await checkAndIncrementUsage(supabase, agent.workspace_id);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Conversation limit exceeded. Upgrade your plan to continue sending.",
          usage,
        },
        { status: 429 }
      );
    }

    const client = new MetaAPIClient(
      decryptToken(connection.access_token),
      connection.phone_number_id
    );
    const result = await client.sendText(recipientPhone, message);
    const messageId = (result.messages as { id: string }[] | undefined)?.[0]?.id ?? null;

    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
