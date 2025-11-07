import Link from "next/link";
import { Section, CodeBlock } from "@/components/docs";

export const metadata = {
  title: "Dashboard guide – button-by-button | Chatmadi Docs",
  description:
    "A practical, numbered, step-by-step guide to the Chatmadi dashboard. Learn exactly what each button does with examples, internal links, and tips.",
};

export default function DashboardDocs() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 id="dashboard" className="mb-6 text-3xl font-semibold">
        Dashboard guide (button-by-button)
      </h1>

      {/* Overview */}
      <Section title="Overview">
        <h2 id="overview" className="sr-only">Overview</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Quick links to all sections.</strong> The Overview page is
            your command center with one-click access to{" "}
            <Link className="underline" href="/docs/dashboard#overview">Overview</Link>,{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>,{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link>,{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>,{" "}
            <Link className="underline" href="/dashboard/billing">Billing</Link>, and{" "}
            <Link className="underline" href="/dashboard/profile">Edit profile</Link>. Think of it as the table of
            contents for your project. New users can start at{" "}
            <Link className="underline" href="/docs/install">Install</Link> to copy the embed code, then hop to{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link> to choose color/position and to{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link> to add greeting + off-hours messages.
            This keeps onboarding simple and predictable.
          </li>
          <li>
            <strong>Use it as your home base after sign-in.</strong> Each time you finish a change, jump back to
            Overview to keep momentum. From there you can quickly open{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link> to confirm impressions, opens, and
            clicks; review{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> if you rely on multilingual
            or business-hours logic; and revisit{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link> to tweak button position or
            WhatsApp prefill. If something looks off, go to{" "}
            <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link> for copy–paste checks, CSP
            notes, and quick smoke tests with{" "}
            <Link className="underline" href="/api/analytics">/api/analytics</Link> and{" "}
            <Link className="underline" href="/api/track-lead">/api/track-lead</Link>.
          </li>
        </ol>
      </Section>

      {/* Widget settings */}
      <Section title="Widget settings">
        <h2 id="widget-settings" className="sr-only">Widget settings</h2>

        <h3 id="widget-id" className="mt-4 text-xl font-semibold">Widget ID</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>What it is and where it appears.</strong> The Widget ID is the unique identifier used by your
            embed code to fetch live settings. You’ll see it in the dashboard and inside the snippets on{" "}
            <Link className="underline" href="/docs/install">Install</Link>. Keep it private; anyone with the ID could
            copy your configuration. Managing multiple sites? Give each site its own Widget ID so their themes,
            positions, languages, business hours, and templates stay independent and analytics remain accurate.
          </li>
          <li>
            <strong>How it’s used across the app.</strong> When you press the copy buttons on{" "}
            <Link className="underline" href="/docs/install">Install</Link>, the ID is injected automatically. Pages
            like{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link>,{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>, and{" "}
            <Link className="underline" href="/dashboard/languages">Languages</Link>{" "}
            use the ID to load or filter their data. If your site looks like it has the wrong theme or messages,
            double-check you embedded the snippet with the intended Widget ID.
          </li>
        </ol>

        <h3 id="theme" className="mt-6 text-xl font-semibold">Theme color</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Pick a color that builds trust.</strong> Choose a color that matches your brand or contrasts well
            with the background so the bubble is visible but not distracting. Updates apply instantly because the
            widget fetches settings on every page view. If you work in sprints, do a quick visual QA on a few key pages
            after saving—home, a long article page, and a checkout page—to ensure legibility everywhere.
          </li>
          <li>
            <strong>Small teams tip.</strong> If you aren’t sure which shade to choose, match your site’s primary button
            color. This keeps the UI consistent and helps users immediately recognize the bubble as an action—just like
            “Add to cart” or “Sign up”.
          </li>
        </ol>

        <h3 id="position" className="mt-6 text-xl font-semibold">Button position</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Bottom-right vs. bottom-left.</strong> Most sites use bottom-right because it avoids typical
            navigation patterns and language pickers that live on the left. If you have other floating UI (e.g., cookie
            banners), choose the opposite side so nothing overlaps. Check on mobile too—the bubble rises above common
            UI like OS home bars.
          </li>
          <li>
            <strong>Accessibility check.</strong> After moving the button, verify keyboard focus reaches it and screen
            readers announce it properly. The fastest way is to tab through your page and listen for “Open WhatsApp
            chat” (or your CTA text).
          </li>
        </ol>

        <h3 id="cta-prefill" className="mt-6 text-xl font-semibold">Icon, CTA text, Prefill message</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Design the first impression.</strong> The icon is the small graphic in the bubble; the CTA is the
            short text next to it (for example, “Chat with us”). Keep it friendly and clear. The Prefill is the message
            users see inside WhatsApp when the chat opens (e.g., “Hi, I’m interested in [your product].”). Keep it short
            to reduce friction; you can add emoji and variables later as you learn from{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link> questions.
          </li>
          <li>
            <strong>Consistency tip.</strong> Use one CTA pattern across your site—home, product pages, and support
            pages—so users don’t need to re-learn what the bubble does in different places.
          </li>
        </ol>

        <h3 id="copy-buttons" className="mt-6 text-xl font-semibold">Copy buttons (Embed &amp; Auto-trigger) + preview</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Embed snippet.</strong> Copies the basic loader you’ll paste before{" "}
            <code>&lt;/body&gt;</code>. See the full walkthrough in{" "}
            <Link className="underline" href="/docs/install">Install</Link> for{" "}
            HTML/WordPress/Webflow/Wix/Squarespace/Shopify/React/Vue/Angular/GTM. After pasting, refresh your site and
            confirm you can see the bubble. The embedded script is async and tiny, so it won’t block rendering.
          </li>
          <li>
            <strong>Auto-trigger snippet.</strong> Copies an optional add-on to open the chat automatically under
            conditions (e.g., delay, exit intent). See{" "}
            <Link className="underline" href="/docs/install#auto-trigger">Install ▸ Auto-trigger</Link>. Start gently:
            opening the chat too aggressively can reduce trust.
          </li>
        </ol>
      </Section>

      {/* Templates */}
      <Section title="Templates">
        <h2 id="templates" className="sr-only">Templates</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Filters and basics.</strong> Use the top controls to filter by Widget ID, locale, and kind
            (e.g., <code>greeting</code>, <code>off_hours</code>, or custom kinds). Press <em>Refresh</em> after
            changes. To add your own kinds, open{" "}
            <Link className="underline" href="/dashboard/templates/kinds">Manage kinds</Link>. New teams should start
            with at least one greeting and one off-hours template per primary language.
          </li>
          <li>
            <strong>Multilingual examples.</strong> We recommend starting with EN/HI/KN/TA. Each locale can have both
            greeting and off-hours variants so the chat always feels native. For advanced rules, see{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> which tests business hours +
            locale fallbacks.
          </li>
        </ol>
      </Section>

      {/* Templates QA */}
      <Section title="Templates QA">
        <h2 id="templates-qa" className="sr-only">Templates QA</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>What it does.</strong> This page runs live checks against{" "}
            <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link> using your current
            languages and hours. Toggle “Include inline business hours” to simulate the typical Mon–Sat, Sun-closed
            pattern and verify the correct message is chosen at 11:15 (greeting) and 23:30 (off-hours).
          </li>
          <li>
            <strong>Reading PASS/FAIL.</strong> If a row fails, click <em>open</em> to see the raw API response and why
            the fallback occurred (e.g., missing locale template). Fix by adding the missing template in{" "}
            <Link className="underline" href="/dashboard/templates">Templates</Link> or by adjusting{" "}
            <Link className="underline" href="/dashboard/hours">Business hours</Link>.
          </li>
        </ol>
      </Section>

      {/* Languages */}
      <Section title="Languages">
        <h2 id="languages" className="sr-only">Languages</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>How locale is chosen.</strong> The widget can read browser preferences and also respects explicit
            overrides you set. When a locale lacks a matching template, the system falls back to English or the default
            language. Test the exact behavior in{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>.
          </li>
          <li>
            <strong>Practical tip.</strong> If most of your audience is bilingual, keep the greeting short and put the
            key ask first (e.g., “How can we help?”). This reduces the cost of mismatches when fallbacks occur.
          </li>
        </ol>
      </Section>

      {/* Business Hours */}
      <Section title="Business hours">
        <h2 id="hours" className="sr-only">Business hours</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Set windows &amp; time zone.</strong> Define your open windows (e.g., Mon–Sat 10:00–18:00; Sun
            closed) and set the correct time zone. Hours feed into{" "}
            <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link> so the API returns a
            greeting inside windows and an off-hours message after hours.
          </li>
          <li>
            <strong>Inline hours for QA.</strong> You can even pass hours as query params to the API for one-off tests.
            See examples on{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>.
          </li>
        </ol>
      </Section>

      {/* Analytics */}
      <Section title="Analytics">
        <h2 id="analytics" className="sr-only">Analytics</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>What we log.</strong> The widget records impressions (bubble views), opens, closes, and clicks.
            CTR is computed from impressions and clicks. Use the day and page tables to find where users interact most,
            then refine your CTA or move the bubble position accordingly.
          </li>
          <li>
            <strong>Smoke test endpoints.</strong> If numbers look low, quickly test{" "}
            <Link className="underline" href="/api/analytics">/api/analytics</Link> and{" "}
            <Link className="underline" href="/api/track-lead">/api/track-lead</Link> with minimal payloads (see{" "}
            <Link className="underline" href="/docs/troubleshooting#smoke">Troubleshooting ▸ Smoke test</Link>). If
            calls succeed but charts stay empty, double-check you embedded the snippet with the correct Widget ID.
          </li>
        </ol>
      </Section>

      {/* Leads */}
      <Section title="Leads">
        <h2 id="leads" className="sr-only">Leads</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Where they appear.</strong> Leads created from the pre-chat panel or API appear in your dashboard.
            For advanced workflows (Google Sheets/CRM), use a webhook as described in{" "}
            <Link className="underline" href="/docs/troubleshooting#webhooks">Troubleshooting ▸ Webhooks</Link>.
          </li>
          <li>
            <strong>Quality tip.</strong> Keep the pre-chat form lightweight—name and message are usually enough. Every
            extra required field reduces completions.
          </li>
        </ol>
      </Section>

      {/* Billing */}
      <Section title="Billing">
        <h2 id="billing" className="sr-only">Billing</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Plans &amp; upgrades.</strong> Use{" "}
            <Link className="underline" href="/dashboard/billing">Billing</Link> to upgrade or downgrade. If you test
            payments, confirm your webhook in the provider dashboard points to the correct production URL.
          </li>
          <li>
            <strong>Common pitfalls.</strong> If plan changes don’t reflect, verify environment variables and webhook
            secrets (see{" "}
            <Link className="underline" href="/docs/troubleshooting#billing">Troubleshooting ▸ Billing</Link>).
          </li>
        </ol>
      </Section>

      {/* Profile */}
      <Section title="Profile">
        <h2 id="profile" className="sr-only">Profile</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Business details &amp; WhatsApp number format.</strong> Keep your business name and WhatsApp number
            correct—these appear in snippets and drivers. Use full international format (e.g., +91…). If messages don’t
            open WhatsApp, double-check the number formatting here first.
          </li>
          <li>
            <strong>Brand hygiene.</strong> If you rebrand, update logo/CTA tone, template language, and theme color in
            one pass so your experience stays cohesive.
          </li>
        </ol>
      </Section>

      {/* Widget behavior & customization */}
      <Section title="Widget behavior & customization">
        <h2 id="behavior" className="sr-only">Widget behavior & customization</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>How the bubble renders.</strong> The script loads async and applies settings at runtime. It’s
            designed to be fast and resilient. See{" "}
            <Link className="underline" href="/docs/install">Install</Link> for safe paste locations and CSP notes.
          </li>
          <li>
            <strong>Auto-trigger rules.</strong> Ship with conservative defaults. If you enable auto-open, prefer a
            time-based delay or on-scroll trigger. Aggressive rules (every pageview) can lower trust and increase
            bounce—measure with{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>.
          </li>
        </ol>
      </Section>

      {/* APIs for developers */}
      <Section title="APIs (for developers)">
        <h2 id="apis" className="sr-only">APIs (for developers)</h2>

        <h3 id="api-widget" className="mt-4 text-xl font-semibold">/api/widget.js</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>What it loads.</strong> Returns the minimal loader that renders the bubble and wires events. It
            reads your Widget ID and fetches settings. See production-safe placement in{" "}
            <Link className="underline" href="/docs/install">Install</Link>.
          </li>
        </ol>

        <h3 id="api-auto" className="mt-6 text-xl font-semibold">/api/auto-trigger</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>When to include.</strong> Include only if you want automatic chat opens based on behavior. Start
            with gentle rules and validate with{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>.
          </li>
        </ol>

        <h3 id="api-analytics" className="mt-6 text-xl font-semibold">/api/analytics &amp; /api/track-lead</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Payload shapes &amp; examples.</strong> These endpoints log interactions and collect leads. Use the
            quick tests in{" "}
            <Link className="underline" href="/docs/troubleshooting#smoke">Troubleshooting ▸ Smoke test</Link> if data
            seems missing. If your charts show leads but no impressions/opens/clicks, verify your environment variables
            and that you’re posting the expected fields.
          </li>
        </ol>

        <h3 id="api-choose" className="mt-6 text-xl font-semibold">/api/templates/choose</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Parameters, fallbacks &amp; business-hours logic.</strong> Pass <code>wid</code>,{" "}
            <code>locale</code>, and optionally <code>h</code>/<code>m</code> to simulate a specific time. Provide
            inline hours via <code>sun=closed</code> or <code>mon=10:00-18:00</code>… for QA scenarios. The endpoint
            chooses a template in this order: widget-scoped templates in the requested locale, global matches, and
            finally defaults. Validate everything on{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>.
          </li>
        </ol>
      </Section>
    </div>
  );
}
