# ChatMadi — Architecture (v2.0 — CRM Platform)

## Overview
Full WhatsApp CRM platform — shared inbox, contact management, automation engine, and business intelligence — built on top of WhatsApp Business Cloud API. The original WhatsApp chat widget remains fully supported as a feature within the platform.

## Tech Stack
- Next.js 14 (TypeScript, App Router), Tailwind CSS
- Supabase (Postgres, Realtime, Auth, Storage, Edge Functions, RLS)
- Vercel (hosting)
- Razorpay (billing, payment links via WhatsApp)
- Resend (transactional email)

## Platform Components

### Core CRM
- **Workspaces** — Multi-tenant root: each business gets one workspace with plan, billing, and usage limits.
- **Agents** — Team members with role-based access (owner / admin / agent / readonly).
- **Contacts** — Every person who has messaged the business; includes CRM fields (lifecycle stage, tags, order history, opt-in status).
- **Conversations** — 24-hour Meta conversation windows with assignment, priority, labels, and SLA tracking.
- **Messages** — All message types (text, media, template, interactive, location, reaction, internal notes).

### Business Tools
- **Templates** — Meta-approved message templates with variable support and approval tracking.
- **Automations** — Rule engine: triggers (keyword match, time-based, inactivity, etc.) → conditions → actions (send message, assign agent, tag, webhook, etc.).
- **Orders** — Industry-agnostic order/transaction system (food orders, appointments, bookings, invoices).
- **Catalog** — Products/services with pricing, inventory, and appointment scheduling support.
- **Broadcasts** — Bulk template messages with audience segmentation and delivery analytics.

### Communication
- **Quick Replies** — `/shortcut` canned responses for agents.
- **Labels** — Color-coded conversation categorization.
- **Notifications** — In-app notifications (new messages, assignments, mentions).

### Integrations
- **WhatsApp Connections** — Meta Cloud API credentials and health monitoring per workspace.
- **Payment Links** — Razorpay payment links sent via WhatsApp with status tracking.
- **Contact Imports** — Bulk CSV import with field mapping and error tracking.
- **Widget Configs** — Extended widget settings (pre-chat, business hours, away messages, domain restrictions).

### Analytics
- **Analytics Daily** — Pre-aggregated daily snapshots for fast dashboard loading.
- **Existing Widget Analytics** — Original impression/click/lead tracking remains unchanged.

## Database Schema
- **20 new tables** defined in `supabase/sql/2026-02-24-001_crm_schema.sql`.
- TypeScript types in `web/src/types/database.ts`.
- All tables have RLS enabled with workspace-scoped policies.
- `updated_at` auto-maintained via triggers.
- Order numbers auto-generated via sequence (`ORD-YYYY-NNNNN`).

## Auth & Multi-tenancy
- Supabase email OTP (magic link) — unchanged.
- Row Level Security: every CRM table scoped to workspace membership (owner or active agent).
- Agents table bridges `auth.users` to workspace access.

## Payments & Billing
- Razorpay Checkout for subscription billing (existing) — unchanged.
- New: Razorpay payment links for in-chat payment collection.
- Plans: trial → starter → growth → pro → enterprise.
- Monthly conversation limits with usage tracking and auto-reset.

## Existing Features (Preserved)
- **Widget embed code** (`/api/widget.js`) — unchanged.
- **Widget analytics** (impressions, clicks, leads) — unchanged.
- **Business triggers** — unchanged.
- **Usage counters** — unchanged.
- **i18n** — English + Indian languages + major world languages.
- **CI/CD** — GitHub Actions (lint + format check) → Vercel deployment.

## Security
- RLS on all tenant tables.
- WhatsApp access tokens stored encrypted (never logged or exposed).
- Rate limiting on public APIs.
- Strict CSP/CORS.
- Server-only secrets.

## Scale Target
Architecture designed for ₹10L MRR: multi-tenant workspace isolation, pre-aggregated analytics, indexed queries, conversation limits per plan tier.
