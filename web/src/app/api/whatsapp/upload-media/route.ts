import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadMedia } from "@/lib/meta/media";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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

    const result = await uploadMedia(connection.phone_number_id, connection.access_token, file);

    return NextResponse.json({ mediaId: result.id });
  } catch (error) {
    console.error("Upload media error:", error);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}
