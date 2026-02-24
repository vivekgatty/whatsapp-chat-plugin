import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { AutomationEngine, executeAutomation } from "@/lib/automations/engine";
import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * POST /api/automations/execute
 *
 * Two modes:
 * 1. Cron mode (empty body or {}) — called by pg_cron every 15 minutes.
 *    Runs all time-based automation checks + wakes snoozed conversations.
 * 2. Direct mode ({automationId, contactId, ...}) — runs a single
 *    automation for a specific contact (backward compatible).
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") ?? "";
    const bearerToken = authHeader.replace("Bearer ", "");
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") ?? bearerToken;

    if (secret !== process.env.AUTOMATION_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    // Direct mode: run a single automation
    if (body.automationId) {
      return handleDirectExecution(body);
    }

    // Cron mode: run all time-based checks
    const results = await handleCronExecution();
    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("Automation execution error:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}

// ── Direct execution (single automation) ───────────────────

async function handleDirectExecution(body: {
  automationId: string;
  contactId?: string;
  conversationId?: string;
  triggerData?: Record<string, unknown>;
}) {
  const db = supabaseAdmin();
  const { automationId, contactId, conversationId, triggerData } = body;

  const { data: automation } = await db
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

  await db.from("automation_logs").insert({
    workspace_id: automation.workspace_id,
    automation_id: automationId,
    contact_id: contactId ?? null,
    conversation_id: conversationId ?? null,
    trigger_data: triggerData,
    actions_executed: result.actionsExecuted,
    status: result.status,
    error_message: result.error ?? null,
  });

  return NextResponse.json({ success: true, result });
}

// ── Cron execution (all time-based triggers) ───────────────

async function handleCronExecution() {
  const db = supabaseAdmin();
  let triggered = 0;
  let errors = 0;

  const { data: workspaces } = await db.from("workspaces").select("id").eq("is_active", true);

  for (const ws of workspaces ?? []) {
    const engine = new AutomationEngine(db, ws.id);

    try {
      triggered += await processNoReplyByAgent(db, engine, ws.id);
    } catch (e) {
      errors++;
      console.error(`no_reply_by_agent error [${ws.id}]:`, e);
    }

    try {
      triggered += await processNoReplyByCustomer(db, engine, ws.id);
    } catch (e) {
      errors++;
      console.error(`no_reply_by_customer error [${ws.id}]:`, e);
    }

    try {
      triggered += await processTimeBased(db, engine, ws.id);
    } catch (e) {
      errors++;
      console.error(`time_based error [${ws.id}]:`, e);
    }

    try {
      triggered += await processAppointmentReminders(db, engine, ws.id);
    } catch (e) {
      errors++;
      console.error(`appointment_reminder error [${ws.id}]:`, e);
    }

    try {
      triggered += await processPaymentOverdue(db, engine, ws.id);
    } catch (e) {
      errors++;
      console.error(`payment_overdue error [${ws.id}]:`, e);
    }

    try {
      triggered += await processInactivity(db, engine, ws.id);
    } catch (e) {
      errors++;
      console.error(`inactivity error [${ws.id}]:`, e);
    }

    try {
      triggered += await processBirthdays(db, engine, ws.id);
    } catch (e) {
      errors++;
      console.error(`birthday error [${ws.id}]:`, e);
    }

    try {
      await wakeSnoozedConversations(db, ws.id);
    } catch (e) {
      console.error(`snooze_wake error [${ws.id}]:`, e);
    }
  }

  return { triggered, errors, workspaces: workspaces?.length ?? 0 };
}

// ── 1. No reply by agent ───────────────────────────────────

async function processNoReplyByAgent(
  db: SupabaseClient,
  engine: AutomationEngine,
  workspaceId: string
): Promise<number> {
  const { data: automations } = await db
    .from("automations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .eq("trigger_type", "no_reply_by_agent");

  let count = 0;

  for (const auto of automations ?? []) {
    const hours = (auto.trigger_config as any)?.hours ?? 2;
    const cutoff = new Date(Date.now() - hours * 3_600_000).toISOString();

    const { data: conversations } = await db
      .from("conversations")
      .select("id, contact_id, last_message_at")
      .eq("workspace_id", workspaceId)
      .eq("status", "open")
      .lt("last_message_at", cutoff)
      .is("first_response_at", null);

    for (const convo of conversations ?? []) {
      const { data: lastMsg } = await db
        .from("messages")
        .select("direction")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastMsg?.direction === "inbound") {
        await engine.trigger("no_reply_by_agent", {
          contactId: convo.contact_id,
          conversationId: convo.id,
        });
        count++;
      }
    }
  }

  return count;
}

// ── 2. No reply by customer ────────────────────────────────

async function processNoReplyByCustomer(
  db: SupabaseClient,
  engine: AutomationEngine,
  workspaceId: string
): Promise<number> {
  const { data: automations } = await db
    .from("automations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .eq("trigger_type", "no_reply_by_customer");

  let count = 0;

  for (const auto of automations ?? []) {
    const hours = (auto.trigger_config as any)?.hours ?? 24;
    const cutoff = new Date(Date.now() - hours * 3_600_000).toISOString();

    const { data: conversations } = await db
      .from("conversations")
      .select("id, contact_id")
      .eq("workspace_id", workspaceId)
      .eq("status", "open")
      .lt("last_message_at", cutoff);

    for (const convo of conversations ?? []) {
      const { data: lastMsg } = await db
        .from("messages")
        .select("direction")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastMsg?.direction === "outbound") {
        await engine.trigger("no_reply_by_customer", {
          contactId: convo.contact_id,
          conversationId: convo.id,
        });
        count++;
      }
    }
  }

  return count;
}

// ── 3. Time-based (cron) ───────────────────────────────────

async function processTimeBased(
  db: SupabaseClient,
  engine: AutomationEngine,
  workspaceId: string
): Promise<number> {
  const { data: automations } = await db
    .from("automations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .eq("trigger_type", "time_based");

  let count = 0;
  const now = new Date();

  for (const auto of automations ?? []) {
    const config = auto.trigger_config as any;
    if (!config?.cron) continue;

    if (cronMatchesNow(config.cron, config.timezone ?? "Asia/Kolkata", now)) {
      const { data: contacts } = await db
        .from("contacts")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("opted_in", true)
        .eq("is_blocked", false);

      for (const contact of contacts ?? []) {
        await engine.trigger("time_based", { contactId: contact.id });
        count++;
      }
    }
  }

  return count;
}

// ── 4. Appointment reminders ───────────────────────────────

async function processAppointmentReminders(
  db: SupabaseClient,
  engine: AutomationEngine,
  workspaceId: string
): Promise<number> {
  const { data: automations } = await db
    .from("automations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .eq("trigger_type", "appointment_reminder");

  let count = 0;

  for (const auto of automations ?? []) {
    const hoursBefore = (auto.trigger_config as any)?.hours_before ?? 24;
    const windowStart = new Date(Date.now() + hoursBefore * 3_600_000 - 7.5 * 60_000).toISOString();
    const windowEnd = new Date(Date.now() + hoursBefore * 3_600_000 + 7.5 * 60_000).toISOString();

    const { data: orders } = await db
      .from("orders")
      .select("id, contact_id, conversation_id")
      .eq("workspace_id", workspaceId)
      .in("order_type", ["appointment", "booking"])
      .not("status", "in", '("cancelled","completed")')
      .gte("scheduled_at", windowStart)
      .lte("scheduled_at", windowEnd);

    for (const order of orders ?? []) {
      await engine.trigger("appointment_reminder", {
        contactId: order.contact_id,
        conversationId: order.conversation_id,
        orderId: order.id,
      });
      count++;
    }
  }

  return count;
}

// ── 5. Payment overdue ─────────────────────────────────────

async function processPaymentOverdue(
  db: SupabaseClient,
  engine: AutomationEngine,
  workspaceId: string
): Promise<number> {
  const { data: automations } = await db
    .from("automations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .eq("trigger_type", "payment_overdue");

  if (!automations?.length) return 0;

  const today = new Date().toISOString().split("T")[0];

  const { data: orders } = await db
    .from("orders")
    .select("id, contact_id, conversation_id")
    .eq("workspace_id", workspaceId)
    .eq("payment_status", "pending")
    .lt("due_date", today)
    .not("status", "eq", "cancelled");

  let count = 0;

  for (const order of orders ?? []) {
    for (const _auto of automations) {
      await engine.trigger("payment_overdue", {
        contactId: order.contact_id,
        conversationId: order.conversation_id,
        orderId: order.id,
      });
      count++;
    }
  }

  return count;
}

// ── 6. Inactivity ──────────────────────────────────────────

async function processInactivity(
  db: SupabaseClient,
  engine: AutomationEngine,
  workspaceId: string
): Promise<number> {
  const { data: automations } = await db
    .from("automations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .eq("trigger_type", "inactivity");

  let count = 0;

  for (const auto of automations ?? []) {
    const days = (auto.trigger_config as any)?.days ?? 30;
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();

    const { data: contacts } = await db
      .from("contacts")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("opted_in", true)
      .eq("is_blocked", false)
      .lt("last_message_at", cutoff)
      .not("last_message_at", "is", null);

    for (const contact of contacts ?? []) {
      await engine.trigger("inactivity", {
        contactId: contact.id,
      });
      count++;
    }
  }

  return count;
}

// ── 7. Birthdays ───────────────────────────────────────────

async function processBirthdays(
  db: SupabaseClient,
  engine: AutomationEngine,
  workspaceId: string
): Promise<number> {
  const { data: automations } = await db
    .from("automations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .eq("trigger_type", "birthday");

  if (!automations?.length) return 0;

  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data: contacts } = await db
    .from("contacts")
    .select("id, custom_fields")
    .eq("workspace_id", workspaceId)
    .eq("opted_in", true)
    .eq("is_blocked", false);

  let count = 0;

  for (const contact of contacts ?? []) {
    const fields = contact.custom_fields as Record<string, any> | null;
    const birthday = fields?.birthday ?? fields?.date_of_birth ?? null;
    if (!birthday) continue;

    const bday = String(birthday);
    if (bday.includes(mmdd)) {
      for (const _auto of automations) {
        await engine.trigger("birthday", {
          contactId: contact.id,
        });
        count++;
      }
    }
  }

  return count;
}

// ── 8. Wake snoozed conversations ──────────────────────────

async function wakeSnoozedConversations(db: SupabaseClient, workspaceId: string) {
  const now = new Date().toISOString();

  await db
    .from("conversations")
    .update({ status: "open", snoozed_until: null })
    .eq("workspace_id", workspaceId)
    .eq("status", "snoozed")
    .lt("snoozed_until", now);
}

// ── Cron expression matcher ────────────────────────────────

function cronMatchesNow(cron: string, timezone: string, now: Date): boolean {
  const parts = cron.split(" ");
  if (parts.length !== 5) return false;

  let localNow: Date;
  try {
    const localeStr = now.toLocaleString("en-US", { timeZone: timezone });
    localNow = new Date(localeStr);
  } catch {
    localNow = now;
  }

  const minute = localNow.getMinutes();
  const hour = localNow.getHours();
  const dayOfMonth = localNow.getDate();
  const month = localNow.getMonth() + 1;
  const dayOfWeek = localNow.getDay();

  return (
    matchesCronField(parts[0], minute) &&
    matchesCronField(parts[1], hour) &&
    matchesCronField(parts[2], dayOfMonth) &&
    matchesCronField(parts[3], month) &&
    matchesCronField(parts[4], dayOfWeek)
  );
}

function matchesCronField(field: string, value: number): boolean {
  if (field === "*") return true;

  // Handle */N step values
  if (field.startsWith("*/")) {
    const step = parseInt(field.slice(2));
    return step > 0 && value % step === 0;
  }

  // Handle comma-separated values
  if (field.includes(",")) {
    return field.split(",").some((v) => parseInt(v) === value);
  }

  // Handle ranges like 1-5
  if (field.includes("-")) {
    const [min, max] = field.split("-").map(Number);
    return value >= min && value <= max;
  }

  return parseInt(field) === value;
}
