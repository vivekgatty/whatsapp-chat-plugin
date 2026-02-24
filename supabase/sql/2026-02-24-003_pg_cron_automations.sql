-- ============================================================
-- pg_cron: Time-based Automation Scheduler
-- Run after 001_crm_schema.sql and 002_automation_helpers.sql
-- ============================================================
--
-- PREREQUISITES:
--   1. Enable pg_cron extension (already in 001_crm_schema.sql)
--   2. Enable pg_net extension for HTTP calls:
CREATE EXTENSION IF NOT EXISTS pg_net;
--
--   3. Set these app-level settings in your Supabase project
--      (Dashboard → SQL Editor or via ALTER DATABASE):
--
--   ALTER DATABASE postgres SET app.settings.automation_url = 'https://chatmadi.com/api/automations/execute';
--   ALTER DATABASE postgres SET app.settings.cron_secret = 'your-automation-webhook-secret-here';
--
-- ============================================================

-- Run every 15 minutes: fires all time-based automation checks
-- (no_reply_by_agent, no_reply_by_customer, time_based,
--  appointment_reminder, payment_overdue, inactivity, birthday)
-- and wakes snoozed conversations.
SELECT cron.schedule(
  'run-time-automations',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.automation_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    ),
    body := '{}'::jsonb
  )
  $$
);

-- Daily analytics snapshot at 1:00 AM IST (19:30 UTC previous day)
-- Calls the analytics aggregation endpoint
SELECT cron.schedule(
  'daily-analytics-snapshot',
  '30 19 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.automation_url') || '/../analytics/snapshot?secret=' || current_setting('app.settings.cron_secret'),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('date', (CURRENT_DATE - INTERVAL '1 day')::date::text)
  )
  $$
);

-- Monthly usage counter reset: first day of each month at midnight UTC
SELECT cron.schedule(
  'monthly-usage-reset',
  '0 0 1 * *',
  $$
  UPDATE workspaces
  SET conversations_used_this_month = 0,
      usage_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  WHERE is_active = TRUE
  $$
);

-- ============================================================
-- NOTES:
--
-- To verify jobs are scheduled:
--   SELECT * FROM cron.job;
--
-- To view execution history:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
--
-- To unschedule:
--   SELECT cron.unschedule('run-time-automations');
--   SELECT cron.unschedule('daily-analytics-snapshot');
--   SELECT cron.unschedule('monthly-usage-reset');
--
-- Required Supabase Dashboard settings (Project Settings → Database):
--   app.settings.automation_url = https://chatmadi.com/api/automations/execute
--   app.settings.cron_secret    = <same as AUTOMATION_WEBHOOK_SECRET in .env>
-- ============================================================
