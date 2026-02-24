import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MetaAPIClient } from "@/lib/meta/api";
import { decryptToken } from "@/lib/utils/encryption";
import { resolveVariables } from "@/lib/automations/variables";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { broadcastId } = await request.json();

    const { data: broadcast } = await supabase
      .from("broadcasts")
      .select("*, templates(*)")
      .eq("id", broadcastId)
      .single();

    if (!broadcast || !broadcast.templates) {
      return NextResponse.json({ error: "Broadcast or template not found" }, { status: 404 });
    }

    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("phone_number_id, access_token")
      .eq("workspace_id", broadcast.workspace_id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "WhatsApp not connected" }, { status: 400 });
    }

    const client = new MetaAPIClient(
      decryptToken(connection.access_token),
      connection.phone_number_id
    );

    await supabase
      .from("broadcasts")
      .update({ status: "sending", started_at: new Date().toISOString() })
      .eq("id", broadcastId);

    const { data: pendingMessages } = await supabase
      .from("broadcast_messages")
      .select("*, contacts(*)")
      .eq("broadcast_id", broadcastId)
      .eq("status", "pending");

    let sent = 0;
    let failed = 0;

    for (const msg of pendingMessages ?? []) {
      try {
        const variables = resolveVariables(broadcast.variable_mapping, msg.contacts);

        const components =
          variables.length > 0
            ? [
                {
                  type: "body",
                  parameters: variables.map((v: string) => ({
                    type: "text",
                    text: v,
                  })),
                },
              ]
            : [];

        await client.sendTemplate(
          msg.contacts.wa_id,
          broadcast.templates.meta_template_name,
          broadcast.templates.language,
          components
        );

        await supabase
          .from("broadcast_messages")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", msg.id);
        sent++;
      } catch {
        await supabase.from("broadcast_messages").update({ status: "failed" }).eq("id", msg.id);
        failed++;
      }
    }

    await supabase
      .from("broadcasts")
      .update({
        status: "sent",
        completed_at: new Date().toISOString(),
        total_sent: sent,
        total_failed: failed,
      })
      .eq("id", broadcastId);

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error("Broadcast send error:", error);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}
