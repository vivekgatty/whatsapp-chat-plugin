import Link from "next/link";
import { Section } from "@/components/docs";

export const metadata = {
  title: "FAQ — Chatmadi WhatsApp Chat Plugin",
  description:
    "Everything about Chatmadi: getting started, install, templates, triggers, business hours, languages, analytics, leads, billing, security, accessibility, API, platforms, and troubleshooting.",
};

export default function FAQDocs() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 id="faq" className="mb-6 text-3xl font-semibold">
        Frequently Asked Questions (FAQ)
      </h1>

      {/* Jump list */}
      <nav aria-label="On this page" className="mb-8">
        <h2 className="mb-2 text-lg font-medium">Jump to</h2>
        <ol className="grid list-decimal gap-2 pl-5 sm:grid-cols-2">
          <li><a className="underline" href="#basics">Basics & Concepts</a></li>
          <li><a className="underline" href="#install">Install & Setup</a></li>
          <li><a className="underline" href="#widget">Widget Behavior</a></li>
          <li><a className="underline" href="#templates">Templates & Languages</a></li>
          <li><a className="underline" href="#hours">Business Hours</a></li>
          <li><a className="underline" href="#trigger">Auto-trigger</a></li>
          <li><a className="underline" href="#analytics">Analytics & Leads</a></li>
          <li><a className="underline" href="#billing">Plans & Billing</a></li>
          <li><a className="underline" href="#security">Security, Privacy & Compliance</a></li>
          <li><a className="underline" href="#api">Developers & API</a></li>
        </ol>
      </nav>

      {/* A) Basics */}
      <Section title="A) Basics & Concepts">
        <h2 id="basics" className="sr-only">Basics & Concepts</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) What is Chatmadi?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Chatmadi adds a WhatsApp chat bubble to your site so visitors can message you instantly.</li>
              <li>It’s copy-paste: drop one script (from <Link className="underline" href="/docs/install">Install</Link>) and configure in the <Link className="underline" href="/docs/dashboard">Dashboard</Link>.</li>
              <li>Works with static sites, WordPress, Webflow, Shopify, Wix, Squarespace, React, Next.js, GTM, and more.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) What is a “Widget ID” and where do I find it?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Your unique identifier used in the embed code to load the correct settings.</li>
              <li>Find it in <Link className="underline" href="/dashboard/widgets">Dashboard ▸ Widget settings</Link> and on <Link className="underline" href="/docs/install">Install</Link>.</li>
              <li>Each site should use its own Widget ID so analytics and templates are isolated per site.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) What are Templates?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Pre-written messages that greet users (business hours) or respond off-hours.</li>
              <li>Create per language and kind (e.g., <code>greeting</code>, <code>off_hours</code>) in <Link className="underline" href="/dashboard/templates">Templates</Link>.</li>
              <li>See real decisions with <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> and the <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link> endpoint.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) What are “triggers”?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Optional rules that auto-open the chat (e.g., “open after 10s on home”).</li>
              <li>Copy the extra block from <Link className="underline" href="/docs/install#auto-trigger">Install ▸ Auto-trigger</Link>.</li>
              <li>Start gently; measure impact in <Link className="underline" href="/dashboard/analytics">Analytics</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">5) What is the Prefill message?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Text that appears in WhatsApp when the user clicks the bubble (you can include emojis and variables).</li>
              <li>Configure it in <Link className="underline" href="/dashboard/widgets">Widget settings</Link>. Keep it short and friendly.</li>
              <li>Avoid long or special characters that some devices may truncate.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">6) Will it slow my site?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>No—loader is tiny and async (see <Link className="underline" href="/docs/troubleshooting#performance">Troubleshooting ▸ Performance</Link>).</li>
              <li>Ensure you include the script only once (not both hardcoded and via GTM).</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* B) Install */}
      <Section title="B) Install & Setup">
        <h2 id="install" className="sr-only">Install & Setup</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) Where exactly do I paste the code?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Just before <code>&lt;/body&gt;</code> in your site template.</li>
              <li>Use platform-specific instructions in <Link className="underline" href="/docs/install#platforms">Install ▸ Platforms</Link> (WordPress/Webflow/Wix/Squarespace/Shopify/React/Next/GTM).</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) How do I verify it’s loading?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Open DevTools ▸ Network and confirm <code>/api/widget.js?wid=…</code> returns <code>200</code>.</li>
              <li>If you don’t see the bubble, review <Link className="underline" href="/docs/troubleshooting#bubble-missing">Troubleshooting ▸ Bubble does not appear</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) I use GTM—how do I add it?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Create a “Custom HTML” tag, paste the snippet, trigger on “All Pages”, publish your container.</li>
              <li>Ensure consent settings don’t block the tag (see your CMP).</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) Does it work on staging domains?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes. Use the same Widget ID or a separate one if you want isolated analytics per environment.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">5) My theme has no footer field—what now?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the platform’s recommended method (plugin, app block, or theme editor) in <Link className="underline" href="/docs/install">Install</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">6) Can I place the bubble on the left?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—set position in <Link className="underline" href="/dashboard/widgets">Widget settings</Link>.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* C) Widget Behavior */}
      <Section title="C) Widget Behavior">
        <h2 id="widget" className="sr-only">Widget Behavior</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) The bubble shows but is behind other elements—how to fix?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Add a tiny z-index override (see <Link className="underline" href="/docs/troubleshooting#bubble-missing">Troubleshooting ▸ A.5</Link>).</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) Does it respect mobile safe areas?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes, bubble is positioned to avoid the home indicator on modern devices.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) Can I change the icon, text, and color?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—use <Link className="underline" href="/dashboard/widgets">Widget settings</Link> to set icon, CTA label, theme color, and prefill message.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) Will it conflict with other chat tools?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>It can overlap visually. Either switch sides or apply spacing; avoid loading multiple bubbles on the same corner.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">5) Can I show/hide on specific pages?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—wrap the snippet with simple checks or use GTM triggers to limit where it appears.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">6) Does it support keyboard and screen readers?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—accessible button semantics and focus states are included (see <Link className="underline" href="/docs/troubleshooting#layout-issues">Troubleshooting ▸ Layout</Link> for any edge fixes).</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* D) Templates & Languages */}
      <Section title="D) Templates & Languages">
        <h2 id="templates" className="sr-only">Templates & Languages</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) How do templates pick greeting vs off-hours?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Based on your Business hours and the user’s time (see <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>).</li>
              <li>API details: <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) What languages are supported?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Create any locale you want (e.g., <code>en</code>, <code>hi</code>, <code>kn</code>, <code>ta</code>).</li>
              <li>If a locale is missing, we fall back to English/default.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) My language shows English—why?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You may not have a template for that locale/kind. Add one in <Link className="underline" href="/dashboard/templates">Templates</Link> and re-test in QA.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) Can I personalize messages?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use short, friendly copy; include emojis sparingly. You can reference your product or page context in the Prefill.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">5) How do I test decisions quickly?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> and open the “link” per row to see the exact API response.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">6) Can I add my own “kinds”?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—use “Manage kinds” inside <Link className="underline" href="/dashboard/templates">Templates</Link> for advanced setups.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* E) Business Hours */}
      <Section title="E) Business Hours">
        <h2 id="hours" className="sr-only">Business Hours</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) How do I set hours and closed days?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Go to <Link className="underline" href="/dashboard/hours">Business hours</Link>, set daily windows and your time zone.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) How do I simulate a specific time?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the QA “Include inline business hours” toggle, or add <code>h</code>/<code>m</code> and inline hours params to the choose URL.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) What if I have split hours (lunch breaks)?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Add multiple windows for the same day in <Link className="underline" href="/dashboard/hours">Business hours</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) Does daylight-saving affect results?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes, we respect your configured time zone rules automatically.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* F) Auto-trigger */}
      <Section title="F) Auto-trigger">
        <h2 id="trigger" className="sr-only">Auto-trigger</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) Why doesn’t auto-trigger work?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You must include the optional snippet from <Link className="underline" href="/docs/install#auto-trigger">Install ▸ Auto-trigger</Link>.</li>
              <li>Check DevTools ▸ Console for JS errors. Start with one simple rule and test.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) Can I trigger on scroll or exit-intent?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—customize the optional snippet (advanced). Begin with time-based rules first.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) Will browsers block it?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>They may suppress aggressive patterns. Keep it light and respect user intent.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* G) Analytics & Leads */}
      <Section title="G) Analytics & Leads">
        <h2 id="analytics" className="sr-only">Analytics & Leads</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) What events are tracked?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Impressions (views), opens, closes, and clicks; leads are stored separately.</li>
              <li>See charts in <Link className="underline" href="/dashboard/analytics">Analytics</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) How is CTR calculated?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Clicks ÷ Impressions over the selected time range (more in <Link className="underline" href="/docs/dashboard#analytics">Dashboard ▸ Analytics</Link>).</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) Can I test events manually?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—copy the smoke tests in <Link className="underline" href="/docs/troubleshooting#smoke-tests">Troubleshooting ▸ Smoke tests</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) Where do leads show up?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>In your dashboard’s leads area (or your CRM if a webhook is configured).</li>
              <li>Keep pre-chat minimal (name + message) to maximize completion.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">5) Analytics are zero—why?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Likely the widget didn’t load or <code>/api/analytics</code> is blocked. See <Link className="underline" href="/docs/troubleshooting#analytics-zeros">Troubleshooting ▸ Analytics</Link>.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* H) Plans & Billing */}
      <Section title="H) Plans & Billing">
        <h2 id="billing" className="sr-only">Plans & Billing</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) Do you have a Free plan?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—see <Link className="underline" href="/dashboard/billing">Billing</Link> for tiers, limits, and upgrade paths.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) Can I change plans anytime?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Yes—upgrade/downgrade from <Link className="underline" href="/dashboard/billing">Billing</Link>. Changes take effect immediately or next cycle as stated.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) Do you offer refunds?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>See <Link className="underline" href="/legal/refunds">Cancellations &amp; Refunds</Link> for policy details.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* I) Security */}
      <Section title="I) Security, Privacy & Compliance">
        <h2 id="security" className="sr-only">Security, Privacy & Compliance</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) What data do you collect?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Basic widget events for analytics; optional lead form fields if you enable pre-chat.</li>
              <li>See <Link className="underline" href="/privacy">Privacy Policy</Link> for specifics.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) Is WhatsApp conversation data stored by Chatmadi?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>No—messages happen in WhatsApp. We don’t store your chat content.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) Do you support GDPR/CCPA?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>We provide mechanisms to honor user requests and minimize data. Configure your CMP to permit the loader if consented.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) CSP & CORS?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>See <Link className="underline" href="/docs/troubleshooting#csp-cors">Troubleshooting ▸ CSP/CORS</Link> for minimal policies and allow-lists.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* J) Developers */}
      <Section title="J) Developers & API">
        <h2 id="api" className="sr-only">Developers & API</h2>
        <ol className="list-decimal space-y-6 pl-5">
          <li>
            <h3 className="font-medium">1) What does /api/widget.js do?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Loads settings and renders the bubble; emits analytics and opens the WhatsApp link.</li>
              <li>See <Link className="underline" href="/docs/dashboard#widget-settings">Dashboard ▸ Widget settings</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">2) What payloads do /api/analytics and /api/track-lead accept?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>JSON body with <code>wid</code>, event info, and optional <code>meta</code>; sample smoke tests in <Link className="underline" href="/docs/troubleshooting#smoke-tests">Troubleshooting ▸ Smoke tests</Link>.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">3) How to test /api/templates/choose?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Open QA rows and use the provided URLs; tweak <code>h</code>, <code>m</code>, and inline hours to simulate scenarios.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">4) Can I lazy-load or defer the widget?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>It’s already async; defer further only if you measure a benefit. Ensure analytics still fire on view.</li>
            </ul>
          </li>

          <li>
            <h3 className="font-medium">5) Versioning and breaking changes?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>We avoid breaking changes; release notes will highlight anything requiring action.</li>
            </ul>
          </li>
        </ol>
      </Section>

      {/* Final help */}
      <Section title="Need more help?">
        <h2 id="more-help" className="sr-only">Need more help</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Review <Link className="underline" href="/docs/troubleshooting">Troubleshooting Guide</Link> for step-by-step fixes.</li>
          <li>Revisit <Link className="underline" href="/docs/install">Install</Link> and <Link className="underline" href="/docs/dashboard">Dashboard</Link> for setup and button-by-button explanations.</li>
        </ol>
      </Section>
    </div>
  );
}
