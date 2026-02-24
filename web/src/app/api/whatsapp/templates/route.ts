import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMetaTemplate, listMetaTemplates } from "@/lib/meta/templates";
import { decryptToken } from "@/lib/utils/encryption";

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("waba_id, access_token")
      .eq("workspace_id", workspaceId)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "WhatsApp not connected" }, { status: 400 });
    }

    const templates = await listMetaTemplates(
      connection.waba_id,
      decryptToken(connection.access_token)
    );

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("List templates error:", error);
    return NextResponse.json({ error: "Failed to list templates" }, { status: 500 });
  }
}

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
    const { workspaceId, name, category, language, components } = body;

    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("waba_id, access_token")
      .eq("workspace_id", workspaceId)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "WhatsApp not connected" }, { status: 400 });
    }

    const result = await createMetaTemplate(
      connection.waba_id,
      decryptToken(connection.access_token),
      {
        name,
        category,
        language,
        components,
      }
    );

    return NextResponse.json({ success: true, template: result });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
