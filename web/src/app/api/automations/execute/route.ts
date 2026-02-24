import { NextResponse } from "next/server";
import { executeAutomation } from "@/lib/automations/engine";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.AUTOMATION_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { automationId, contactId, conversationId, triggerData } = body;

    const supabase = createClient();

    const { data: automation } = await supabase
      .from("automations")
      .select("*")
      .eq("id", automationId)
      .eq("is_active", true)
      .single();

    if (!automation) {
      return NextResponse.json({ error: "Automation not found or inactive" }, { status: 404 });
    }

    const result = await executeAutomation(automation, {
      contactId,
      conversationId,
      triggerData,
    });

    await supabase.from("automation_logs").insert({
      workspace_id: automation.workspace_id,
      automation_id: automationId,
      contact_id: contactId,
      conversation_id: conversationId,
      trigger_data: triggerData,
      actions_executed: result.actionsExecuted,
      status: result.status,
      error_message: result.error,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Automation execution error:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
