import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTemplateMessage } from "@/lib/meta/api";

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
    const { contactId, templateId, variables } = body;

    const { data: agent } = await supabase
      .from("agents")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { data: contact } = await supabase
      .from("contacts")
      .select("wa_id")
      .eq("id", contactId)
      .single();

    const { data: template } = await supabase
      .from("templates")
      .select("meta_template_name, language")
      .eq("id", templateId)
      .single();

    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("phone_number_id, access_token")
      .eq("workspace_id", agent.workspace_id)
      .single();

    if (!contact || !template || !connection) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const result = await sendTemplateMessage(
      connection.phone_number_id,
      connection.access_token,
      contact.wa_id,
      template.meta_template_name,
      template.language,
      variables ?? []
    );

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Send template error:", error);
    return NextResponse.json({ error: "Failed to send template" }, { status: 500 });
  }
}
