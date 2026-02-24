import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MetaAPIClient } from "@/lib/meta/api";
import { decryptToken } from "@/lib/utils/encryption";

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

    const components =
      variables && variables.length > 0
        ? [
            {
              type: "body",
              parameters: (variables as string[]).map((v: string) => ({
                type: "text",
                text: v,
              })),
            },
          ]
        : [];

    const client = new MetaAPIClient(
      decryptToken(connection.access_token),
      connection.phone_number_id
    );
    const result = await client.sendTemplate(
      contact.wa_id,
      template.meta_template_name,
      template.language,
      components
    );
    const messageId = (result.messages as { id: string }[] | undefined)?.[0]?.id ?? null;

    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error("Send template error:", error);
    return NextResponse.json({ error: "Failed to send template" }, { status: 500 });
  }
}
