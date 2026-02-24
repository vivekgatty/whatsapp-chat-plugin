import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function aggregateDailyAnalytics(date: string): Promise<{ count: number }> {
  const db = supabaseAdmin();
  const dayStart = `${date}T00:00:00Z`;
  const dayEnd = `${date}T23:59:59Z`;

  const { data: workspaces } = await db.from("workspaces").select("id");
  if (!workspaces) return { count: 0 };

  for (const ws of workspaces) {
    const wid = ws.id;

    const [convos, messages, contacts, orders, automationLogs] = await Promise.all([
      db
        .from("conversations")
        .select("id, status, resolved_at, first_response_time_seconds, resolution_time_seconds", {
          count: "exact",
        })
        .eq("workspace_id", wid)
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd),
      db
        .from("messages")
        .select("direction", { count: "exact" })
        .eq("workspace_id", wid)
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd),
      db
        .from("contacts")
        .select("id", { count: "exact" })
        .eq("workspace_id", wid)
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd),
      db
        .from("orders")
        .select("status, total_amount")
        .eq("workspace_id", wid)
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd),
      db
        .from("automation_logs")
        .select("id", { count: "exact" })
        .eq("workspace_id", wid)
        .gte("triggered_at", dayStart)
        .lte("triggered_at", dayEnd),
    ]);

    const inbound = (messages.data ?? []).filter((m) => m.direction === "inbound").length;
    const outbound = (messages.data ?? []).filter((m) => m.direction === "outbound").length;
    const resolved = (convos.data ?? []).filter((c) => c.resolved_at).length;
    const completedOrders = (orders.data ?? []).filter((o) => o.status === "completed");
    const revenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

    const frtValues = (convos.data ?? [])
      .map((c) => c.first_response_time_seconds)
      .filter((v): v is number => v != null);
    const avgFrt =
      frtValues.length > 0
        ? Math.round(frtValues.reduce((a, b) => a + b, 0) / frtValues.length)
        : 0;

    const resValues = (convos.data ?? [])
      .map((c) => c.resolution_time_seconds)
      .filter((v): v is number => v != null);
    const avgRes =
      resValues.length > 0
        ? Math.round(resValues.reduce((a, b) => a + b, 0) / resValues.length)
        : 0;

    await db.from("analytics_daily").upsert(
      {
        workspace_id: wid,
        date,
        new_conversations: convos.count ?? 0,
        resolved_conversations: resolved,
        messages_received: inbound,
        messages_sent: outbound,
        new_contacts: contacts.count ?? 0,
        orders_created: (orders.data ?? []).length,
        orders_completed: completedOrders.length,
        revenue_logged: revenue,
        automations_triggered: automationLogs.count ?? 0,
        avg_first_response_seconds: avgFrt,
        avg_resolution_seconds: avgRes,
      },
      { onConflict: "workspace_id,date" }
    );
  }

  return { count: workspaces.length };
}
