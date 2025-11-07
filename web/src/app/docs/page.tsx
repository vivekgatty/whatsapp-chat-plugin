import Link from "next/link";
import { Section } from "@/components/docs";

export const metadata = {
  title: "Docs — Chatmadi WhatsApp Chat Plugin",
  description:
    "Start here: what Chatmadi is, how it works, benefits, install, widget settings, templates, languages, hours, auto-trigger, analytics, platforms, security, and roadmap.",
};

export default function DocsHome() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-3 text-3xl font-semibold">
        Chatmadi Docs: WhatsApp Chat Plugin Overview
      </h1>
      <p className="mb-6 text-slate-300">
        Use this page as your guided starting point. For step-by-step installs, see{" "}
        <Link className="underline" href="/docs/install">Install</Link>. For usage help, see{" "}
        <Link className="underline" href="/docs/dashboard">Dashboard</Link>,{" "}
        <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>, and{" "}
        <Link className="underline" href="/docs/faq">FAQ</Link>.
      </p>

      <Section title="What Chatmadi Is (Quick Definition)">
        <h2 className="sr-only">What Chatmadi Is</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>1) A lightweight WhatsApp chat bubble:</strong> Add a floating button to your website
            that opens WhatsApp with your business number and a prefilled message. No complex setup,
            no coding required—just copy one embed from{" "}
            <Link className="underline" href="/docs/install">Install</Link>.
          </li>
          <li>
            <strong>2) Built for conversions:</strong> Encourage instant contact, shorten response time,
            and capture more leads. Measure impact in{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>.
          </li>
          <li>
            <strong>3) Central control hub:</strong> Manage all settings in{" "}
            <Link className="underline" href="/docs/dashboard">Dashboard</Link>—widget style, messages,
            languages, business hours, and auto-trigger.
          </li>
        </ol>
      </Section>

      <Section title="Key Benefits for Your Site">
        <h2 className="sr-only">Key Benefits</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>1) Faster replies, happier visitors:</strong> WhatsApp is familiar for users; you’ll
            get questions in one tap. Control tone and guidance via{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link>.
          </li>
          <li>
            <strong>2) Works everywhere:</strong> WordPress, Webflow, Shopify, Wix, Squarespace, Next.js.
            See platform notes in{" "}
            <Link className="underline" href="/docs/install#platforms">Install ▸ Platforms</Link> and{" "}
            <Link className="underline" href="/docs/faq#platforms">FAQ ▸ Platforms</Link>.
          </li>
          <li>
            <strong>3) SEO & performance friendly:</strong> Async loader, tiny footprint, and no blocking.
            Performance tips live in{" "}
            <Link className="underline" href="/docs/troubleshooting#performance">Troubleshooting ▸ Performance</Link>.
          </li>
        </ol>
      </Section>

      <Section title="How It Works in 3 Steps">
        <h2 className="sr-only">How It Works</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>1) Install:</strong> Paste a single embed before <code>&lt;/body&gt;</code> (or via GTM).
            Exact snippets and screenshots in{" "}
            <Link className="underline" href="/docs/install">Install</Link>.
          </li>
          <li>
            <strong>2) Configure:</strong> In{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>, set your WhatsApp
            number (E.164 format), theme color, position, CTA text, and prefill message.
          </li>
          <li>
            <strong>3) Go live:</strong> Add multilingual{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link> (greeting/off_hours), define{" "}
            <Link className="underline" href="/dashboard/hours">Business hours</Link>, and verify with{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>.
          </li>
        </ol>
      </Section>

      <Section title="Features You Can Use Today">
        <h2 className="sr-only">Features</h2>
        <h3 className="mb-2 text-xl font-medium">A) Widget & Display</h3>
        <ol className="list-decimal space-y-3 pl-5 mb-6">
          <li>
            <strong>1) Style & position:</strong> Choose corner, color, and icon in{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>. Preview changes live.
          </li>
          <li>
            <strong>2) Prefill & CTA:</strong> Craft a short, friendly prefill to guide the conversation.
          </li>
        </ol>

        <h3 className="mb-2 text-xl font-medium">B) Templates & Languages</h3>
        <ol className="list-decimal space-y-3 pl-5 mb-6">
          <li>
            <strong>1) Greeting vs off-hours:</strong> Set messages for within or outside business hours.
            Manage in{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link>; test via{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>.
          </li>
          <li>
            <strong>2) Multilingual support:</strong> Add locales like <code>en</code>, <code>hi</code>,{" "}
            <code>kn</code>, <code>ta</code>, with safe fallback to English.
          </li>
        </ol>

        <h3 className="mb-2 text-xl font-medium">C) Hours, Auto-trigger, Analytics</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>1) Business hours:</strong> Define daily windows and closed days in{" "}
            <Link className="underline" href="/dashboard/hours">Business hours</Link>; timezone aware.
          </li>
          <li>
            <strong>2) Auto-trigger (optional):</strong> Show the bubble proactively with a tiny add-on
            script. Setup steps in{" "}
            <Link className="underline" href="/docs/install#auto-trigger">Install ▸ Auto-trigger</Link>.
          </li>
          <li>
            <strong>3) Analytics & leads:</strong> Track impressions, opens, closes, clicks; view metrics in{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>. Debug paths in{" "}
            <Link className="underline" href="/docs/troubleshooting#smoke-tests">Troubleshooting ▸ Smoke tests</Link>.
          </li>
        </ol>
      </Section>

      <Section title="Security, Privacy, & Compliance">
        <h2 className="sr-only">Security & Compliance</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>1) Conversations stay on WhatsApp:</strong> We don’t store chats. We only log widget events
            and optional leads you collect. See{" "}
            <Link className="underline" href="/privacy">Privacy Policy</Link> and{" "}
            <Link className="underline" href="/docs/troubleshooting#csp-cors">CSP/CORS notes</Link>.
          </li>
          <li>
            <strong>2) Consent-friendly:</strong> Works with popular CMPs; load after consent if required.
          </li>
        </ol>
      </Section>

      <Section title="Roadmap & What’s Coming">
        <h2 className="sr-only">Roadmap</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>1) More template logic:</strong> Holidays, variables, and richer targeting.
          </li>
          <li>
            <strong>2) Deeper analytics & exports:</strong> Funnel views, CSV, and alerts.
          </li>
          <li>
            <strong>3) UI polish & presets:</strong> One-click style themes and platform presets.
          </li>
        </ol>
        <p className="mt-4 text-slate-300">
          Ready to begin? Start with{" "}
          <Link className="underline" href="/docs/install">Install</Link>, then explore{" "}
          <Link className="underline" href="/docs/dashboard">Dashboard</Link> and{" "}
          <Link className="underline" href="/docs/faq">FAQ</Link>.
        </p>
      </Section>
    </div>
  );
}
