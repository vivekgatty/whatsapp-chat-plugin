import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { requireFeatureAccess } from "@/lib/feature-access";

export const runtime = "nodejs";

type BusinessRow = {
  id: string;
  name?: string | null;
  timezone?: string | null;
  wa_number?: string | null;
  whatsapp_cc?: string | null;
  whatsapp_number?: string | null;
};

function toE164(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+]/g, "").trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("+")) return cleaned;
  return `+${cleaned}`;
}

function mergeWhatsAppNumber(b: BusinessRow): string | null {
  const direct = toE164(b.wa_number);
  if (direct) return direct;

  const cc = (b.whatsapp_cc || "").replace(/[^\d+]/g, "");
  const number = (b.whatsapp_number || "").replace(/\D/g, "");
  if (!number) return null;
  const merged = `${cc || "+"}${number}`;
  return toE164(merged);
}

function startEndUtcForDateInTimezone(dateISO: string, timezone: string): { start: string; end: string } {
  const start = new Date(`${dateISO}T00:00:00`);
  const end = new Date(`${dateISO}T23:59:59.999`);

  const startUtc = new Date(start.toLocaleString("en-US", { timeZone: "UTC" }));
  const startTz = new Date(start.toLocaleString("en-US", { timeZone: timezone }));
  const offsetMs = startUtc.getTime() - startTz.getTime();

  return {
    start: new Date(start.getTime() + offsetMs).toISOString(),
    end: new Date(end.getTime() + offsetMs).toISOString(),
  };
}

function nowParts(timezone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    date: `${byType.year}-${byType.month}-${byType.day}`,
    hour: Number(byType.hour || "0"),
  };
}

async function safeCount(
  db: ReturnType<typeof supabaseAdmin>,
  table: string,
  filters: Array<[string, unknown]>,
  start?: string,
  end?: string,
): Promise<number> {
  try {
    let q = db.from(table).select("id", { count: "exact", head: true });
    for (const [k, v] of filters) q = q.eq(k, v as string | number | boolean);
    if (start) q = q.gte("created_at", start);
    if (end) q = q.lte("created_at", end);
    const { count } = await q;
    return Number(count || 0);
  } catch {
    return 0;
  }
}


function numberField(row: unknown, key: string): number {
  if (!row || typeof row !== "object") return 0;
  const value = Reflect.get(row, key);
  return Number(value || 0);
}

async function safeRevenue(db: ReturnType<typeof supabaseAdmin>, businessId: string, start: string, end: string): Promise<{ orders: number; revenue: number }> {
  const candidates: Array<{ table: string; amount: string }> = [
    { table: "orders", amount: "amount" },
    { table: "payments", amount: "amount" },
    { table: "billing_orders", amount: "amount" },
  ];

  for (const c of candidates) {
    try {
      const { data } = await db
        .from(c.table)
        .select(`id,${c.amount},created_at,business_id`)
         .eq("workspace_id", businessId)
        .gte("created_at", start)
        .lte("created_at", end);

      if (Array.isArray(data)) {
        const orders = data.length;
        const revenue = data.reduce((acc, row) => acc + numberField(row, c.amount), 0);
        return { orders, revenue };
      }
    } catch {}
  }

  return { orders: 0, revenue: 0 };
}

function buildMessage(input: {
  businessName: string;
  date: string;
  newConversations: number;
  messagesReceived: number;
  resolved: number;
  open: number;
  newContacts: number;
  activeContacts: number;
  ordersCreated: number;
  revenue: number;
  pendingLines: string[];
  automationCount: number;
}) {
  const pendingBody = input.pendingLines.length ? input.pendingLines.join("\n") : "• None 🎉";

  return `📊 Daily Summary — ${input.businessName}\n📅 ${input.date}\n━━━━━━━━━━━━━━━━━━━━\n📩 New conversations: ${input.newConversations}\n💬 Messages received: ${input.messagesReceived}\n✅ Resolved today: ${input.resolved}\n⏳ Still open: ${input.open}\n\n👥 Contact Activity\n• New contacts: ${input.newContacts}\n• Active contacts: ${input.activeContacts}\n\n💰 Revenue\n• Orders created: ${input.ordersCreated}\n• Revenue logged: ₹${input.revenue}\n\n⚡ Needs Attention\n${pendingBody}\n\n🤖 Automations fired: ${input.automationCount}\n\nReply REPORT for full week breakdown`;
}

async function sendWhatsAppText(to: string, body: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    throw new Error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
  }

  const recipient = to.replace(/\D/g, "");
  const r = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body },
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`WhatsApp send failed (${r.status}): ${t}`);
  }

  return r.json();
}

export async function GET(req: NextRequest) {
  try {
    const access = await requireFeatureAccess(req, "DAILY_REPORT");
    if (!access.ok) return NextResponse.json({ ok: false, error: access.error }, { status: access.status });

    const db = supabaseAdmin();

    const { data: business } = await db
      .from("businesses")
      .select("id,name,timezone,wa_number,whatsapp_cc,whatsapp_number")
      .eq("id", access.workspaceId)
      .maybeSingle<BusinessRow>();

    if (!business?.id) {
      return NextResponse.json({ ok: true, skipped: true, reason: "no_business" });
    }

    const timezone = business.timezone || process.env.WORKSPACE_TIMEZONE || "Asia/Kolkata";
    const { date, hour } = nowParts(timezone);
    const force = req.nextUrl.searchParams.get("force") === "1";
    if (!force && hour !== 20) {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_8pm", timezone, hour, date });
    }

    const already = await db
      .from("analytics")
      .select("id", { head: true, count: "exact" })
       .eq("workspace_id", business.id)
      .eq("event_type", "daily_summary_sent")
      .eq("meta->>date", date);

    if (!force && Number(already.count || 0) > 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: "already_sent", date });
    }

    const { start, end } = startEndUtcForDateInTimezone(date, timezone);

    const newConversations = await safeCount(db, "conversations", [["workspace_id", business.id]], start, end);
    const messagesReceived = await safeCount(db, "messages", [["workspace_id", business.id], ["direction", "inbound"]], start, end);
    const resolved = await safeCount(db, "conversations", [["workspace_id", business.id], ["status", "resolved"]], start, end);
    const open = await safeCount(db, "conversations", [["workspace_id", business.id], ["status", "open"]]);

    const newContacts = await safeCount(db, "contacts", [["workspace_id", business.id]], start, end);
    const activeContacts = await safeCount(db, "contacts", [["workspace_id", business.id], ["is_active", true]]);

    const { orders, revenue } = await safeRevenue(db, business.id, start, end);

    let pending: Array<{ contact_name?: string | null; waiting_hours?: number | null }> = [];
    try {
      const { data } = await db
        .from("follow_ups")
        .select("contact_name,waiting_hours")
         .eq("workspace_id", business.id)
        .eq("status", "pending")
        .order("waiting_hours", { ascending: false })
        .limit(8);
      pending = data ?? [];
    } catch {
      pending = [];
    }

    const pendingLines = pending.map((row) => `• ${row.contact_name || "Unknown"} — waiting ${Number(row.waiting_hours || 0)}h`);

    const automationCount = await safeCount(db, "automation_logs", [["workspace_id", business.id]], start, end);

    const msg = buildMessage({
      businessName: business.name || "Workspace",
      date,
      newConversations,
      messagesReceived,
      resolved,
      open,
      newContacts,
      activeContacts,
      ordersCreated: orders,
      revenue,
      pendingLines,
      automationCount,
    });

    const ownerNumber = mergeWhatsAppNumber(business);
    if (!ownerNumber) {
      return NextResponse.json({ ok: false, error: "missing_owner_whatsapp_number" }, { status: 400 });
    }

    const providerResponse = await sendWhatsAppText(ownerNumber, msg);

    await db.from("analytics").insert({
      workspace_id: business.id,
      event_type: "daily_summary_sent",
      meta: { date, timezone, owner_number: ownerNumber, provider: "whatsapp_cloud" },
    });

    return NextResponse.json({ ok: true, sent_to: ownerNumber, date, providerResponse });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
