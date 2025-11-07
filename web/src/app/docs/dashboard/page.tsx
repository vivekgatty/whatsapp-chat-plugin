import Link from "next/link";
import { Section } from "@/components/docs";

/**
 * Dashboard docs (pointer-first, with internal links).
 * Each bullet ≈100+ words for readability + SEO depth.
 */

export default function DashboardDocs() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <h1 className="text-2xl font-semibold mb-2">Dashboard guide (button-by-button)</h1>

      <Section title="Overview">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Quick links to all sections.</strong> The Overview page acts like your command center with clear links
            to every major part of the product—
            <Link className="underline" href="/dashboard">Overview</Link>,{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>,{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link>,{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>,{" "}
            <Link className="underline" href="/dashboard/billing">Billing</Link>, and{" "}
            <Link className="underline" href="/dashboard/profile">Edit profile</Link>. Think of it as a live table of contents:
            when you sign in, you can jump straight to configuration, content, reports, and account areas without hunting
            through menus. For new users, start with{" "}
            <Link className="underline" href="/docs/install">Install</Link> to copy your embed code, then visit{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link> to set color and position, and{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link> to add your greeting/off-hours messages.
          </li>
          <li>
            <strong>Use it as a home base after sign-in.</strong> Return to Overview whenever you finish a task to stay oriented.
            From there, you can validate changes quickly: open{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link> to confirm impressions and clicks,
            check{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> if you use multilingual messages
            or business hours, and revisit{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link> if you want to tweak the button
            position or the WhatsApp prefill text. If anything looks off, the{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link> page lists copy-paste checks,
            CSP notes, and a quick smoke test using the{" "}
            <Link className="underline" href="/api/analytics">/api/analytics</Link> and{" "}
            <Link className="underline" href="/api/track-lead">/api/track-lead</Link> endpoints.
          </li>
        </ul>
      </Section>

      <Section title="Widget settings">
        <h3 className="text-lg font-medium mt-4 mb-1">Widget ID</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>What it is and where it’s used.</strong> Your Widget ID is the unique identifier that connects the
            bubble on your website to the configuration you see in{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>. You’ll paste it inside the install
            snippets from{" "}
            <Link className="underline" href="/docs/install">Install</Link>. Keep it private—anyone with the ID could reuse
            your configuration. If you manage several sites, assign one Widget ID per site so you get clean{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link> and a per-site set of{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link>. You can always confirm the active ID at
            the top of{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link> or use the “Use my widget ID”
            helper in the left Docs sidebar, which auto-injects the ID into any copy buttons on the docs pages.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Theme color</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Pick a color your visitors trust.</strong> The theme color controls the chat bubble and helps it blend
            into your brand without disappearing. Choose a primary or accent color that contrasts enough with your site so
            the bubble remains visible. Update the color in{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>, then reload your page—the snippet
            pulls the latest settings on each view. If you are testing on a staging site, try two or three accessible colors
            and compare click-through in{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>. Keep a note in{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link> if you use strict CSP.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Button position</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Choose bottom-left or bottom-right.</strong> Most sites use bottom-right because it avoids overlapping
            typical navigation, but bottom-left can work better if you have sticky share bars or mobile UI that lives on
            the right. The widget is responsive and shifts above common mobile chrome. If you already use another floating
            widget (for example a “Back to top” button), place that on the opposite side so the chat bubble has room.
            Configure position in{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link> and validate on phone and desktop.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Icon, CTA text, Prefill message</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Make the first impression count.</strong> The icon sets the small glyph in the bubble; the CTA text is
            the short label like “Chat with us”; and the Prefill message is what opens inside WhatsApp, saving your visitor
            from typing. A friendly starter such as “Hi! I’m interested in <em>your service</em>” works well. Configure all
            three in{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>. Keep it short and clear; you can
            tweak later based on real questions in{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>. Emojis are fine—use sparingly so the
            message stays readable.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Pre-chat requirements</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Collect name/phone if you need it.</strong> If you want a tiny form before opening WhatsApp—e.g., Name
            and a short Message—enable pre-chat in{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>. This helps teams route chats and
            improves lead quality in{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>. Keep the form minimal; the goal is to
            start the conversation, not create friction. Use{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link> to keep replies consistent and{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> to verify multilingual behavior.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Copy buttons (Embed &amp; Auto-trigger) + live preview</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Install in seconds.</strong> The <em>Embed</em> button copies the one-tag script you paste into your
            site (see{" "}
            <Link className="underline" href="/docs/install">Install</Link>). The <em>Auto-trigger</em> button copies an
            extra tag for timed/scroll triggers. Both snippets replace <code>&lt;WIDGET_ID&gt;</code> if you use the “Use my
            widget ID” helper in the docs sidebar. After pasting, reload your page to see a live bubble. If nothing shows,
            visit{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link> for CSP and caching checks.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Examples (placement, CSP notes)</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Where to paste and what to whitelist.</strong> For HTML sites, paste before <code>&lt;/body&gt;</code>.
            For WordPress, use <em>Appearance → Theme File Editor → footer.php</em> or a header/footer plugin; for Shopify,
            edit <code>theme.liquid</code>; see full step-by-step in{" "}
            <Link className="underline" href="/docs/install">Install</Link>. If your site uses a Content-Security-Policy,
            add the script domain to <code>script-src</code> and allow <code>connect-src</code> to the API host. Exact
            rules are listed under{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>.
          </li>
        </ul>
      </Section>

      <Section title="Templates">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Filters &amp; creating multilingual replies.</strong> Use the controls at{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link> to filter by Widget ID, Locale, and
            Kind. Create a short “greeting” and an “off_hours” message for each language you want (e.g., EN/HI/KN/TA). Use{" "}
            <Link className="underline" href="/dashboard/templates/kinds">Manage kinds</Link> for custom categories. Validate
            behavior with{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> which shows PASS/FAIL and what
            the API would choose for a given time and locale.
          </li>
        </ul>
      </Section>

      <Section title="Languages & business hours">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>How the right message is chosen.</strong> The chooser endpoint{" "}
            <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link> considers locale and your
            Mon–Sat hours (Sun closed by default). Set hours in the dashboard or pass them inline during testing. During
            off-hours it selects “off_hours”; otherwise it selects “greeting”. The QA screen can include inline hours to
            simulate scenarios. See full install + hours guidance in{" "}
            <Link className="underline" href="/docs/install">Install</Link> and deep-dive examples in{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>.
          </li>
        </ul>
      </Section>

      <Section title="Analytics & leads">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>What we log and how CTR is shown.</strong>{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link> aggregates impressions, opens, closes,
            and clicks and shows a day/page breakdown. CTR is derived from impressions → clicks. Leads appear if you use
            pre-chat or send the lead payload to{" "}
            <Link className="underline" href="/api/track-lead">/api/track-lead</Link>. For smoke-testing, post to{" "}
            <Link className="underline" href="/api/analytics">/api/analytics</Link> and confirm the counts move—see exact
            shapes in the API section of{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>.
          </li>
        </ul>
      </Section>

      <Section title="APIs (for developers)">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Endpoints at a glance.</strong> The embed script{" "}
            <Link className="underline" href="/api/widget.js">/api/widget.js</Link> loads the bubble and emits events used
            by{" "}
            <Link className="underline" href="/api/analytics">/api/analytics</Link>. Optional{" "}
            <Link className="underline" href="/api/auto-trigger">/api/auto-trigger</Link> helps you control timing rules.
            Lead capture goes to{" "}
            <Link className="underline" href="/api/track-lead">/api/track-lead</Link>. Message selection lives at{" "}
            <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link> and supports locale +
            hours fallbacks. See code snippets and example payloads in{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>.
          </li>
        </ul>
      </Section>
    </div>
  );
}
