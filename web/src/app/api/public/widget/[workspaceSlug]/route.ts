import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ workspaceSlug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceSlug } = await context.params;
    const supabase = createClient();

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, name, is_active")
      .eq("slug", workspaceSlug)
      .eq("is_active", true)
      .single();

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const { data: config } = await supabase
      .from("widget_configs")
      .select("*")
      .eq("workspace_id", workspace.id)
      .single();

    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("phone_number, display_phone_number, business_name")
      .eq("workspace_id", workspace.id)
      .single();

    return NextResponse.json({
      workspace: { name: workspace.name },
      phone: connection?.phone_number ?? null,
      businessName: connection?.business_name ?? workspace.name,
      config: config
        ? {
            position: config.position,
            buttonColor: config.button_color,
            buttonIcon: config.button_icon,
            preChatTitle: config.pre_chat_title,
            preChatMessage: config.pre_chat_message,
            greetingMessage: config.greeting_message,
            preFilledMessage: config.pre_filled_message,
            showOnMobile: config.show_on_mobile,
            showOnDesktop: config.show_on_desktop,
          }
        : null,
    });
  } catch (error) {
    console.error("Widget config error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
