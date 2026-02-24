import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireApiSession } from "@/lib/apiAuth";
import fs from "node:fs";
import path from "node:path";

type Status = "pass" | "fail" | "manual";

type Check = {
  key: string;
  status: Status;
  details: string;
};

function envSet(name: string): boolean {
  return Boolean((process.env[name] || "").trim());
}

function has32ByteKey(raw: string): boolean {
  if (!raw) return false;
  if (/^[a-fA-F0-9]{64}$/.test(raw)) return true;
  try {
    return Buffer.from(raw, "base64").length === 32;
  } catch {
    return false;
  }
}

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const checks: Check[] = [];

  checks.push({
    key: "meta_business_verification",
    status: "manual",
    details: "Verify in Meta Business Manager (external prerequisite).",
  });

  checks.push({
    key: "webhook_url_configured",
    status: "manual",
    details: "Ensure Meta app webhook URL points to /api/whatsapp/webhook.",
  });

  checks.push({
    key: "whatsapp_webhook_verify_token",
    status: envSet("WHATSAPP_WEBHOOK_VERIFY_TOKEN") ? "pass" : "fail",
    details: "WHATSAPP_WEBHOOK_VERIFY_TOKEN must be set.",
  });

  checks.push({
    key: "razorpay_webhook_and_plans",
    status: envSet("RAZORPAY_KEY_ID") && envSet("RAZORPAY_KEY_SECRET") ? "manual" : "fail",
    details: "Keys present; confirm plans + webhook in Razorpay dashboard.",
  });

  checks.push({
    key: "resend_emails",
    status: envSet("RESEND_API_KEY") ? "manual" : "fail",
    details: "RESEND_API_KEY set; verify domain + invite/receipt/summary flows manually.",
  });

  checks.push({
    key: "encryption_key_32_bytes",
    status: has32ByteKey(process.env.ENCRYPTION_KEY || process.env.TOKEN_ENCRYPTION_KEY || "") ? "pass" : "fail",
    details: "ENCRYPTION_KEY (or TOKEN_ENCRYPTION_KEY) must decode to exactly 32 bytes.",
  });

  checks.push({
    key: "sentry_monitoring",
    status: envSet("SENTRY_DSN") ? "pass" : "manual",
    details: "Set SENTRY_DSN for error monitoring (recommended).",
  });

  let analyticsDaily = 0;
  let templateCount = 0;
  try {
    const db = getSupabaseAdmin();
    const { count: c1 } = await db.from("analytics_daily").select("day", { head: true, count: "exact" });
    analyticsDaily = Number(c1 || 0);

    const { count: c2 } = await db.from("templates").select("id", { head: true, count: "exact" });
    templateCount = Number(c2 || 0);
  } catch {
    // keep defaults
  }

  checks.push({
    key: "analytics_daily_snapshots",
    status: analyticsDaily > 0 ? "pass" : "manual",
    details: analyticsDaily > 0 ? `analytics_daily rows present (${analyticsDaily}).` : "No snapshots detected yet; verify snapshot cron.",
  });

  checks.push({
    key: "templates_seeded",
    status: templateCount >= 5 ? "pass" : "manual",
    details: `Found ${templateCount} templates; target at least 5 approved templates per major industry in Meta.`,
  });

  let cronConfigured = false;
  try {
    const vercelPath = path.join(process.cwd(), "vercel.json");
    const txt = fs.readFileSync(vercelPath, "utf8");
    const cfg = JSON.parse(txt) as { crons?: Array<{ path?: string }> };
    const paths = new Set((cfg.crons || []).map((c) => c.path));
    cronConfigured = paths.has("/api/reports/daily-summary") && paths.has("/api/templates/sync-meta");
  } catch {
    cronConfigured = false;
  }

  checks.push({
    key: "cron_config",
    status: cronConfigured ? "pass" : "fail",
    details: "vercel.json should include daily summary + template sync cron entries.",
  });

  checks.push({
    key: "supabase_rls_isolation",
    status: "manual",
    details: "Test with anon key + cross-tenant IDs to confirm workspace isolation.",
  });

  checks.push({
    key: "widget_external_domain_test",
    status: "manual",
    details: "Install widget script on non-local domain and validate opens + analytics.",
  });

  checks.push({
    key: "mobile_browser_test",
    status: "manual",
    details: "Validate mobile inbox behavior on iOS Safari + Android Chrome.",
  });

  checks.push({
    key: "razorpay_test_payment",
    status: "manual",
    details: "Run end-to-end test payment and confirm webhook updates subscription state.",
  });

  checks.push({
    key: "meta_webhook_test_event",
    status: "manual",
    details: "Send Meta test event and verify it appears in webhook_events queue/processor logs.",
  });

  return NextResponse.json({ ok: true, checks });
}
