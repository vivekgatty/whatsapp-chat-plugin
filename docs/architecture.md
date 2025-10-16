# WhatsApp Chat Plugin — Architecture (v0.1)

## Overview
SaaS for adding a WhatsApp chat widget to any website. Includes dashboard, analytics, i18n, plan limits, and Razorpay billing.

## Tech Stack
- Next.js (TypeScript, App Router), Tailwind
- Supabase (Postgres, Auth, RLS)
- Vercel (hosting)
- Razorpay (Checkout + Webhook)

## Components
- **Dashboard (Next.js):** Onboarding, Business Profile, Widget Settings, Analytics, Billing.
- **Embed script:** `/api/widget.js` serves tenant-scoped JS that renders the bubble + optional pre-chat.
- **APIs:** `/api/log` (analytics/leads), `/api/payment-webhook` (Razorpay).
- **DB Tables:** users, businesses, widgets, leads, plans, subscriptions, analytics.

## Auth & Multitenancy
- Supabase email OTP (magic link).
- Row Level Security: users can only access their tenant rows.

## Payments
- Free: 100 messages/month; Pro: unlimited.
- Razorpay Checkout → webhook verifies HMAC → update `subscriptions`.

## Analytics (tracking plan)
Events: widget_view, chat_click, lead_submit, limit_reached, payment_success.
Privacy-first: no PII in analytics events.

## Performance Budget (widget)
- ≤ 12 KB gzipped
- TTI < 3s, CLS < 0.1

## Security
- RLS on all tenant tables, rate limiting on `/api/log`, strict CSP/CORS, server-only secrets.

## i18n
English + Indian languages (hi, bn, te, mr, ta, gu, kn, ml, pa, ur, or, as) + major world (es, fr, de, pt, it, ru, ar, zh-Hans, zh-Hant, ja, ko, id, tr, vi, th).

## Environments
- Local dev
- Vercel production (env vars in Vercel dashboard)

## Roadmap (post-MVP)
- Native plugins (WordPress/Shopify)
- A/B tests for CTA
- AI reply suggestions
