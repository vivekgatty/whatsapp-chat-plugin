import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTextMessage } from "@/lib/meta/api";

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
      recipientPhone = convo?.contacts?.wa_id;
    }

    if (!recipientPhone) {
      return NextResponse.json({ error: "No recipient phone number" }, { status: 400 });
    }

    const result = await sendTextMessage(
      connection.phone_number_id,
      connection.access_token,
      recipientPhone,
      message
    );

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
