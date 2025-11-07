import Link from "next/link";
import Script from "next/script";
import { Section } from "@/components/docs";

export const metadata = {
  title: "FAQ — Chatmadi WhatsApp Chat Plugin",
  description:
    "Complete FAQ for Chatmadi: basics, install, widget, templates, languages, business hours, auto-trigger, analytics, leads, billing, security, API, and platform-specific guides.",
};

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="faq-item rounded-md border border-slate-700 bg-slate-900/60 p-4">
      <summary className="cursor-pointer list-none font-medium marker:hidden hover:underline">
        {q}
      </summary>
      <div className="mt-3 space-y-2 text-slate-200">{children}</div>
    </details>
  );
}

export default function FAQDocs() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 id="faq" className="mb-2 text-3xl font-semibold">
        Frequently Asked Questions (FAQ)
      </h1>
      <p className="mb-6 text-slate-300">
        Short, clickable questions. Click to expand an answer. Use the search to filter instantly.
      </p>

      {/* Search box */}
      <div className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-4">
        <label htmlFor="faq-search" className="block text-sm font-medium text-slate-300">
          Search FAQ
        </label>
        <input
          id="faq-search"
          type="search"
          placeholder="Type keywords like: install, WordPress, hours, analytics…"
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
          aria-describedby="faq-search-help"
        />
        <div id="faq-search-help" className="mt-2 text-xs text-slate-400">
          Showing <span id="faq-count">—</span> matching questions. Quick links:{" "}
          <a className="underline" href="#basics">Basics</a> ·{" "}
          <a className="underline" href="#install">Install</a> ·{" "}
          <a className="underline" href="#widget">Widget</a> ·{" "}
          <a className="underline" href="#templates">Templates</a> ·{" "}
          <a className="underline" href="#hours">Hours</a> ·{" "}
          <a className="underline" href="#trigger">Auto-trigger</a> ·{" "}
          <a className="underline" href="#analytics">Analytics</a> ·{" "}
          <a className="underline" href="#billing">Billing</a> ·{" "}
          <a className="underline" href="#security">Security</a> ·{" "}
          <a className="underline" href="#api">API</a> ·{" "}
          <a className="underline" href="#platforms">Platforms</a>
        </div>
      </div>

      {/* Live filter (runs on the client) */}
      <Script id="faq-filter" strategy="afterInteractive">{`
        (function(){
          var input = document.getElementById('faq-search');
          if(!input) return;
          var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
          var countEl = document.getElementById('faq-count');
          function apply(){
            var q = (input.value || '').trim().toLowerCase();
            var visible = 0;
            items.forEach(function(d){
              var text = (d.textContent || '').toLowerCase();
              var show = !q || text.indexOf(q) !== -1;
              d.style.display = show ? '' : 'none';
              if(show) visible++;
              if(!show) d.open = false;
            });
            if(countEl) countEl.textContent = String(visible);
          }
          input.addEventListener('input', apply);
          apply();
        })();
      `}</Script>

      {/* A) Basics */}
      <Section title="A) Basics & Concepts">
        <h2 id="basics" className="sr-only">Basics & Concepts</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="What is Chatmadi and what problem does it solve?">
            <ul className="list-disc pl-5">
              <li>Adds a WhatsApp chat bubble so visitors can message you instantly.</li>
              <li>Copy-paste install; configure everything in the <Link className="underline" href="/docs/dashboard">Dashboard</Link>.</li>
              <li>Great for lead gen, faster replies, and higher conversion on mobile.</li>
            </ul>
          </Q>
          <Q q="Where do I find my Widget ID?">
            <ul className="list-disc pl-5">
              <li>See <Link className="underline" href="/dashboard/widgets">Dashboard ▸ Widget settings</Link> or <Link className="underline" href="/docs/install">Install</Link>.</li>
              <li>Each site/app should use its own Widget ID to keep analytics separate.</li>
            </ul>
          </Q>
          <Q q="What are Templates and Kinds (greeting/off_hours)?">
            <ul className="list-disc pl-5">
              <li>Templates are messages shown based on time and language.</li>
              <li>Kinds: <code>greeting</code> during hours, <code>off_hours</code> outside hours. See <Link className="underline" href="/dashboard/templates">Templates</Link>.</li>
            </ul>
          </Q>
          <Q q="Do I need coding knowledge to use Chatmadi?">
            <ul className="list-disc pl-5">
              <li>No—follow <Link className="underline" href="/docs/install">Install</Link>. For advanced rules, see <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>.</li>
            </ul>
          </Q>
          <Q q="Will Chatmadi slow my site or impact Core Web Vitals?">
            <ul className="list-disc pl-5">
              <li>Loader is tiny and async. See <Link className="underline" href="/docs/troubleshooting#performance">Performance tips</Link>.</li>
            </ul>
          </Q>
          <Q q="Can I use multiple languages?">
            <ul className="list-disc pl-5">
              <li>Yes—add locales like <code>en</code>, <code>hi</code>, <code>kn</code>, <code>ta</code>. Fallback to English if not found.</li>
              <li>Test decisions in <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>.</li>
            </ul>
          </Q>
          <Q q="What is the Prefill message and where do I set it?">
            <ul className="list-disc pl-5">
              <li>Shown inside WhatsApp after click—set it in <Link className="underline" href="/dashboard/widgets">Widget settings</Link>.</li>
            </ul>
          </Q>
          <Q q="Can I run Chatmadi on multiple sites?">
            <ul className="list-disc pl-5">
              <li>Yes—use one Widget ID per site unless you want shared analytics/templates.</li>
            </ul>
          </Q>

          {/* new (8) */}
          <Q q="Do I need a WhatsApp Business number or will a personal number work?">
            <ul className="list-disc pl-5">
              <li>Both work; we open a <code>wa.me</code> chat to whatever number you configure.</li>
              <li>Use international E.164 format (e.g., <code>+919876543210</code>) in <Link className="underline" href="/dashboard/widgets">Widget settings</Link>.</li>
            </ul>
          </Q>
          <Q q="Can I use a landline number or VoIP?">
            <ul className="list-disc pl-5">
              <li>No—WhatsApp requires a mobile-activated number. Use a number registered with WhatsApp/WhatsApp Business.</li>
            </ul>
          </Q>
          <Q q="Can I show different messages on different pages?">
            <ul className="list-disc pl-5">
              <li>Yes—use separate Widget IDs per site/section, or advanced rules via the optional auto-trigger snippet.</li>
              <li>See <Link className="underline" href="/docs/install#auto-trigger">Install ▸ Auto-trigger</Link>.</li>
            </ul>
          </Q>
          <Q q="Does Chatmadi keep a copy of WhatsApp conversations?">
            <ul className="list-disc pl-5">
              <li>No—chats happen in WhatsApp. We only log widget events and optional leads. See <Link className="underline" href="/privacy">Privacy Policy</Link>.</li>
            </ul>
          </Q>
          <Q q="Can I migrate from another chat widget easily?">
            <ul className="list-disc pl-5">
              <li>Yes—remove the old script, paste Chatmadi before <code>&lt;/body&gt;</code>, verify in <Link className="underline" href="/dashboard/analytics">Analytics</Link>.</li>
            </ul>
          </Q>
          <Q q="Does Chatmadi work on AMP pages?">
            <ul className="list-disc pl-5">
              <li>AMP disallows arbitrary JS. Link a floating CTA to your WhatsApp instead, or use non-AMP pages for chat.</li>
            </ul>
          </Q>
          <Q q="Can I use Chatmadi with consent managers (GDPR/CCPA)?">
            <ul className="list-disc pl-5">
              <li>Yes—allow the loader after consent. See <Link className="underline" href="/docs/troubleshooting#csp-cors">CSP/consent notes</Link>.</li>
            </ul>
          </Q>
          <Q q="Does Chatmadi support right-to-left languages (Arabic/Hebrew)?">
            <ul className="list-disc pl-5">
              <li>Yes for templates; widget UI is neutral. You can add RTL templates and test in <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link>.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* B) Install */}
      <Section title="B) Install & Setup">
        <h2 id="install" className="sr-only">Install & Setup</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="Exactly where do I paste the embed code?">
            <ul className="list-disc pl-5">
              <li>Before <code>&lt;/body&gt;</code> in your theme/layout. See <Link className="underline" href="/docs/install#platforms">Install ▸ Platforms</Link>.</li>
            </ul>
          </Q>
          <Q q="How do I install via Google Tag Manager (GTM)?">
            <ul className="list-disc pl-5">
              <li>Create a Custom HTML tag, paste the snippet, trigger on All Pages, publish.</li>
              <li>Ensure your CMP/consent doesn’t block the tag.</li>
            </ul>
          </Q>
          <Q q="How do I know it’s working after install?">
            <ul className="list-disc pl-5">
              <li>Check DevTools ▸ Network for <code>/api/widget.js?wid=…</code> = 200 and see the bubble on page.</li>
            </ul>
          </Q>
          <Q q="Can I hide the bubble on certain pages?">
            <ul className="list-disc pl-5">
              <li>Yes—use GTM page rules or add simple path checks around the snippet.</li>
            </ul>
          </Q>
          <Q q="Do I need to reinstall after changing settings?">
            <ul className="list-disc pl-5">
              <li>No—settings are fetched on load. Just refresh your site.</li>
            </ul>
          </Q>
          <Q q="My theme has no footer—how do I add the code?">
            <ul className="list-disc pl-5">
              <li>Use the platform’s “custom code”/“HTML” block (see <Link className="underline" href="/docs/install">Install</Link>).</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Should I use separate Widget IDs for staging and production?">
            <ul className="list-disc pl-5">
              <li>Yes—keep analytics clean. Create one Widget ID per environment in <Link className="underline" href="/dashboard/widgets">Widget settings</Link>.</li>
            </ul>
          </Q>
          <Q q="Why do I see two bubbles after installation?">
            <ul className="list-disc pl-5">
              <li>The snippet may be injected twice (e.g., GTM + theme). Remove duplicates and keep only one include.</li>
            </ul>
          </Q>
          <Q q="Do CDN caches delay configuration changes?">
            <ul className="list-disc pl-5">
              <li>No reinstall needed—config is fetched live by the loader. Hard refresh if you don’t see changes.</li>
            </ul>
          </Q>
          <Q q="How do I inject the script only on selected pages?">
            <ul className="list-disc pl-5">
              <li>In GTM, use Page Path triggers; in themes, conditionally render the snippet based on route.</li>
            </ul>
          </Q>
          <Q q="Does it work on Single Page Apps (no full reload)?">
            <ul className="list-disc pl-5">
              <li>Yes—loaded once. Route changes don’t require re-injecting the script. Verify analytics still fire.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* C) Widget Behavior */}
      <Section title="C) Widget Behavior">
        <h2 id="widget" className="sr-only">Widget Behavior</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="Bubble is behind other elements—how to fix z-index?">
            <ul className="list-disc pl-5">
              <li>Add small CSS override per <Link className="underline" href="/docs/troubleshooting#bubble-missing">Troubleshooting ▸ A.5</Link>.</li>
            </ul>
          </Q>
          <Q q="Can I change side, icon, color, CTA, and prefill?">
            <ul className="list-disc pl-5">
              <li>Yes—go to <Link className="underline" href="/dashboard/widgets">Widget settings</Link>.</li>
            </ul>
          </Q>
          <Q q="Does it work well on mobile and respect safe areas?">
            <ul className="list-disc pl-5">
              <li>Yes—positioning avoids bottom insets and common overlays.</li>
            </ul>
          </Q>
          <Q q="Can I run Chatmadi alongside another chat tool?">
            <ul className="list-disc pl-5">
              <li>Prefer different corners to avoid overlap; measure impact on UX.</li>
            </ul>
          </Q>
          <Q q="Is the widget accessible (keyboard/screen readers)?">
            <ul className="list-disc pl-5">
              <li>Yes—button semantics + focus styles; see <Link className="underline" href="/docs/troubleshooting#layout-issues">layout tips</Link>.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Can I offset the bubble from the edge or raise its size slightly?">
            <ul className="list-disc pl-5">
              <li>Use the position and theme controls in <Link className="underline" href="/dashboard/widgets">Widget settings</Link>. Advanced custom CSS is possible via your theme if needed.</li>
            </ul>
          </Q>
          <Q q="Can I show different CTAs on desktop vs mobile?">
            <ul className="list-disc pl-5">
              <li>Simple approach: load a different Widget ID per device class using GTM device targeting.</li>
            </ul>
          </Q>
          <Q q="Can the click open WhatsApp Web on desktop and app on mobile automatically?">
            <ul className="list-disc pl-5">
              <li>Yes—WhatsApp handles this via <code>wa.me</code>. We pass your number + prefill text; platform chooses Web/app.</li>
            </ul>
          </Q>
          <Q q="Can I deep link to a specific WhatsApp catalog or product?">
            <ul className="list-disc pl-5">
              <li>Not at the moment via the widget; you can add catalog links inside your website content as complements.</li>
            </ul>
          </Q>
          <Q q="Can I log when users attempt to click but WhatsApp is blocked by the device?">
            <ul className="list-disc pl-5">
              <li>We log the click event. If WhatsApp can’t open, the event still appears in <Link className="underline" href="/dashboard/analytics">Analytics</Link>.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* D) Templates & Languages */}
      <Section title="D) Templates & Languages">
        <h2 id="templates" className="sr-only">Templates & Languages</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="How are greeting vs. off-hours chosen?">
            <ul className="list-disc pl-5">
              <li>We check your Business hours and time; see <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> and <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link>.</li>
            </ul>
          </Q>
          <Q q="Why do I see English for my language?">
            <ul className="list-disc pl-5">
              <li>Missing locale template for that kind—add it in <Link className="underline" href="/dashboard/templates">Templates</Link>.</li>
            </ul>
          </Q>
          <Q q="Can I add my own kinds beyond greeting/off_hours?">
            <ul className="list-disc pl-5">
              <li>Yes—use “Manage kinds” in <Link className="underline" href="/dashboard/templates">Templates</Link> for advanced setups.</li>
            </ul>
          </Q>
          <Q q="Best practices for writing templates?">
            <ul className="list-disc pl-5">
              <li>Friendly, short, action-oriented; avoid jargon; keep emojis minimal.</li>
            </ul>
          </Q>
          <Q q="How do I test language fallback quickly?">
            <ul className="list-disc pl-5">
              <li>Use QA links and modify <code>locale=</code> in the URL to simulate.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Do you support template variables (like {{name}})?">
            <ul className="list-disc pl-5">
              <li>Not yet—keep text generic and welcoming. If needed, you can maintain page-specific Widget IDs with tailored copy.</li>
            </ul>
          </Q>
          <Q q="Is there a character limit for message bodies?">
            <ul className="list-disc pl-5">
              <li>WhatsApp supports long messages, but concise works best. Keep to a couple of short sentences.</li>
            </ul>
          </Q>
          <Q q="Can I include emojis and line breaks in templates?">
            <ul className="list-disc pl-5">
              <li>Yes. Use them sparingly; test in <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> to confirm rendering.</li>
            </ul>
          </Q>
          <Q q="What is the minimum set of templates to create?">
            <ul className="list-disc pl-5">
              <li>At least one <code>greeting</code> and one <code>off_hours</code> in your primary locale. Add other locales as needed.</li>
            </ul>
          </Q>
          <Q q="Can I prioritize a locale (e.g., always show Hindi if available)?">
            <ul className="list-disc pl-5">
              <li>Templates follow requested locale with fallback to English. For strict locale targeting, segment traffic with different Widget IDs.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* E) Business Hours */}
      <Section title="E) Business Hours">
        <h2 id="hours" className="sr-only">Business Hours</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="Where do I set hours, timezone, and closed days?">
            <ul className="list-disc pl-5">
              <li>Go to <Link className="underline" href="/dashboard/hours">Business hours</Link>. You can add multiple windows per day.</li>
            </ul>
          </Q>
          <Q q="How do I simulate ‘now’ vs. off-hours?">
            <ul className="list-disc pl-5">
              <li>Use QA toggle “Include inline business hours” or add <code>h</code>/<code>m</code> + inline hours to the choose URL.</li>
            </ul>
          </Q>
          <Q q="Do DST/timezone rules affect decisions?">
            <ul className="list-disc pl-5">
              <li>Yes—your configured timezone controls the logic automatically.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Can I add two windows in one day (e.g., 10:00–13:00 and 15:00–18:00)?">
            <ul className="list-disc pl-5">
              <li>Yes—add multiple ranges per day in <Link className="underline" href="/dashboard/hours">Business hours</Link>.</li>
            </ul>
          </Q>
          <Q q="How do I mark a public holiday as closed?">
            <ul className="list-disc pl-5">
              <li>Temporarily clear that day’s ranges or toggle “closed” for that date (manual). Holiday calendars are planned.</li>
            </ul>
          </Q>
          <Q q="We operate 24/7—what should I set?">
            <ul className="list-disc pl-5">
              <li>Set a single window covering the day (e.g., 00:00–23:59) for all days. Then only <code>greeting</code> will show.</li>
            </ul>
          </Q>
          <Q q="Our shift crosses midnight—how to configure?">
            <ul className="list-disc pl-5">
              <li>Split into two windows: e.g., 20:00–23:59 on Day 1 and 00:00–04:00 on Day 2.</li>
            </ul>
          </Q>
          <Q q="Can I preview which kind will show at a given time?">
            <ul className="list-disc pl-5">
              <li>Yes—use <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> or call <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link> with <code>h</code>/<code>m</code> params.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* F) Auto-trigger */}
      <Section title="F) Auto-trigger">
        <h2 id="trigger" className="sr-only">Auto-trigger</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="Auto-trigger didn’t fire—what did I miss?">
            <ul className="list-disc pl-5">
              <li>You must include the optional snippet from <Link className="underline" href="/docs/install#auto-trigger">Install ▸ Auto-trigger</Link>.</li>
              <li>Start simple (delay rule), then layer scroll/exit logic.</li>
            </ul>
          </Q>
          <Q q="Will browsers block auto-open behavior?">
            <ul className="list-disc pl-5">
              <li>Some aggressive patterns might be suppressed; keep it gentle and useful.</li>
            </ul>
          </Q>
          <Q q="Can I open only on certain pages or UTM campaigns?">
            <ul className="list-disc pl-5">
              <li>Yes—add simple path/UTM checks around the optional script.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="What’s a sensible delay before auto-open to avoid being intrusive?">
            <ul className="list-disc pl-5">
              <li>3–8 seconds on landing pages, longer on articles. Always A/B test impact on bounce and CTR.</li>
            </ul>
          </Q>
          <Q q="How do I cap frequency (e.g., once per day)?">
            <ul className="list-disc pl-5">
              <li>Use a small cookie/localStorage flag in your optional snippet. See patterns in <Link className="underline" href="/docs/troubleshooting#auto-trigger">Troubleshooting</Link>.</li>
            </ul>
          </Q>
          <Q q="Can I trigger on exit-intent?">
            <ul className="list-disc pl-5">
              <li>You can approximate with mouseout/top-edge checks on desktop. Test carefully; don’t nag users.</li>
            </ul>
          </Q>
          <Q q="Will auto-trigger conflict with my page modal?">
            <ul className="list-disc pl-5">
              <li>Space modals to avoid overlap. Prefer showing the chat only after a modal closes.</li>
            </ul>
          </Q>
          <Q q="Can I programmatically open/close the bubble from my app code?">
            <ul className="list-disc pl-5">
              <li>Yes—expose a small global from your optional snippet to call open/close after your conditions are met.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* G) Analytics & Leads */}
      <Section title="G) Analytics & Leads">
        <h2 id="analytics" className="sr-only">Analytics & Leads</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="Which events are tracked and where do I see them?">
            <ul className="list-disc pl-5">
              <li>Impressions, opens, closes, clicks; leads separately. See <Link className="underline" href="/dashboard/analytics">Analytics</Link>.</li>
            </ul>
          </Q>
          <Q q="How is CTR calculated?">
            <ul className="list-disc pl-5">
              <li>Clicks ÷ Impressions for the period (see <Link className="underline" href="/docs/dashboard#analytics">Dashboard ▸ Analytics</Link>).</li>
            </ul>
          </Q>
          <Q q="Analytics show zeros—how do I debug?">
            <ul className="list-disc pl-5">
              <li>Confirm widget loads and events post. Run smoke tests in <Link className="underline" href="/docs/troubleshooting#smoke-tests">Troubleshooting ▸ Smoke tests</Link>.</li>
            </ul>
          </Q>
          <Q q="Where do I view leads?">
            <ul className="list-disc pl-5">
              <li>In the dashboard (or your CRM if a webhook is configured). Keep pre-chat short to reduce drop-off.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Do bots inflate impressions?">
            <ul className="list-disc pl-5">
              <li>Most crawlers don’t execute our JS. Analytics count client-side events from real browsers.</li>
            </ul>
          </Q>
          <Q q="How fast are analytics updated?">
            <ul className="list-disc pl-5">
              <li>Near real-time. Refresh the dashboard; clear cache if numbers seem stale.</li>
            </ul>
          </Q>
          <Q q="Can I export analytics as CSV?">
            <ul className="list-disc pl-5">
              <li>Roadmap item. For now, you can mirror events via your own endpoint using a webhook/proxy pattern.</li>
            </ul>
          </Q>
          <Q q="What happens if my lead webhook is down?">
            <ul className="list-disc pl-5">
              <li>Leads still store in Chatmadi; webhook retries are limited—monitor your endpoint health.</li>
            </ul>
          </Q>
          <Q q="Can I attribute leads to pages or campaigns?">
            <ul className="list-disc pl-5">
              <li>Yes—page path and optional UTM/metadata can be included in lead payloads/analytics meta.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* H) Plans & Billing */}
      <Section title="H) Plans & Billing">
        <h2 id="billing" className="sr-only">Plans & Billing</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="Is there a Free plan and can I switch plans anytime?">
            <ul className="list-disc pl-5">
              <li>Yes—see <Link className="underline" href="/dashboard/billing">Billing</Link> for tiers and upgrades/downgrades.</li>
            </ul>
          </Q>
          <Q q="What is your refund policy?">
            <ul className="list-disc pl-5">
              <li>See <Link className="underline" href="/legal/refunds">Cancellations &amp; Refunds</Link> for details.</li>
            </ul>
          </Q>
          <Q q="Will my settings be preserved if I change plans?">
            <ul className="list-disc pl-5">
              <li>Yes—plan changes don’t alter your Widget ID or templates.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Do you offer annual billing or discounts?">
            <ul className="list-disc pl-5">
              <li>Yes—annual tiers are discounted. See <Link className="underline" href="/dashboard/billing">Billing</Link> for details.</li>
            </ul>
          </Q>
          <Q q="What happens if payment fails?">
            <ul className="list-disc pl-5">
              <li>We’ll retry and notify you. After a grace period, premium features may pause until resolved.</li>
            </ul>
          </Q>
          <Q q="Can I get invoices in my company’s name with GST?">
            <ul className="list-disc pl-5">
              <li>Yes—add billing details in your profile; invoices reflect that information.</li>
            </ul>
          </Q>
          <Q q="Does the Free plan include analytics?">
            <ul className="list-disc pl-5">
              <li>Yes—core event counts are visible. Advanced reports may require a paid tier.</li>
            </ul>
          </Q>
          <Q q="Will my widget stop working if my plan expires?">
            <ul className="list-disc pl-5">
              <li>Core chat continues; premium extras may be disabled until renewal.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* I) Security */}
      <Section title="I) Security, Privacy & Compliance">
        <h2 id="security" className="sr-only">Security, Privacy & Compliance</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="What data does Chatmadi store?">
            <ul className="list-disc pl-5">
              <li>Widget events and optional lead form data. WhatsApp conversations happen in WhatsApp, not on Chatmadi.</li>
              <li>See <Link className="underline" href="/privacy">Privacy Policy</Link>.</li>
            </ul>
          </Q>
          <Q q="Do you support GDPR/CCPA compliance workflows?">
            <ul className="list-disc pl-5">
              <li>Yes—respect user requests; configure your CMP so the loader is allowed with consent.</li>
            </ul>
          </Q>
          <Q q="Any CSP/CORS allow-lists needed?">
            <ul className="list-disc pl-5">
              <li>See <Link className="underline" href="/docs/troubleshooting#csp-cors">Troubleshooting ▸ CSP/CORS</Link> for minimal policies.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Where are your servers located and do you encrypt data in transit?">
            <ul className="list-disc pl-5">
              <li>We use reputable cloud regions with TLS for all endpoints. Persistent data is stored securely.</li>
            </ul>
          </Q>
          <Q q="Can I request data export or deletion for compliance?">
            <ul className="list-disc pl-5">
              <li>Yes—contact support with your Widget ID/business details; we’ll process per policy.</li>
            </ul>
          </Q>
          <Q q="How do you handle DDoS or abuse attempts?">
            <ul className="list-disc pl-5">
              <li>Rate limits and upstream protections are in place; suspicious traffic is mitigated.</li>
            </ul>
          </Q>
          <Q q="Do you store WhatsApp phone numbers of visitors?">
            <ul className="list-disc pl-5">
              <li>No—unless a visitor submits a lead form you’ve enabled; then the provided fields are stored.</li>
            </ul>
          </Q>
          <Q q="Can I restrict the widget to certain referrers or origins?">
            <ul className="list-disc pl-5">
              <li>Yes—contact support for origin restrictions if you need stricter embedding rules.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* J) Developers & API */}
      <Section title="J) Developers & API">
        <h2 id="api" className="sr-only">Developers & API</h2>
        <div className="space-y-4">
          {/* existing */}
          <Q q="What does /api/widget.js do?">
            <ul className="list-disc pl-5">
              <li>Loads settings, renders bubble, emits analytics, and opens WhatsApp. Details in <Link className="underline" href="/docs/dashboard#widget-settings">Dashboard ▸ Widget settings</Link>.</li>
            </ul>
          </Q>
          <Q q="What are the payloads for /api/analytics and /api/track-lead?">
            <ul className="list-disc pl-5">
              <li>JSON with <code>wid</code>, event name, and optional <code>meta</code>. See <Link className="underline" href="/docs/troubleshooting#smoke-tests">Smoke tests</Link>.</li>
            </ul>
          </Q>
          <Q q="How do I test /api/templates/choose quickly?">
            <ul className="list-disc pl-5">
              <li>Use <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> and open each link; change <code>locale</code>, <code>h</code>, and <code>m</code> to simulate.</li>
            </ul>
          </Q>
          <Q q="Can I lazy-load or defer the widget even more?">
            <ul className="list-disc pl-5">
              <li>It’s already async. If you defer further, verify analytics still fire on impressions.</li>
            </ul>
          </Q>
          <Q q="Do you publish breaking changes?">
            <ul className="list-disc pl-5">
              <li>We avoid them; release notes will call out anything that needs action.</li>
            </ul>
          </Q>

          {/* new (5) */}
          <Q q="Are there API rate limits I should know about?">
            <ul className="list-disc pl-5">
              <li>Yes—reasonable per-IP and per-Widget ID limits apply to protect service stability.</li>
            </ul>
          </Q>
          <Q q="Can I self-host the loader script?">
            <ul className="list-disc pl-5">
              <li>Not recommended—config and updates ship via our CDN. Self-hosting risks stale behavior.</li>
            </ul>
          </Q>
          <Q q="Do you support ES module imports instead of a script tag?">
            <ul className="list-disc pl-5">
              <li>Use the provided script tag for consistency and minimal overhead.</li>
            </ul>
          </Q>
          <Q q="Can I post analytics from my server (server-to-server)?">
            <ul className="list-disc pl-5">
              <li>Client events are preferred. Server relays are possible; preserve the <code>wid</code> and event semantics.</li>
            </ul>
          </Q>
          <Q q="How do I debug CORS issues calling your APIs?">
            <ul className="list-disc pl-5">
              <li>Use same-origin fetches from the browser where possible; for server calls, ensure proper headers per <Link className="underline" href="/docs/troubleshooting#csp-cors">CSP/CORS</Link>.</li>
            </ul>
          </Q>
        </div>
      </Section>

      {/* K) Platforms */}
      <Section title="K) Platform Quick FAQs">
        <h2 id="platforms" className="sr-only">Platform Quick FAQs</h2>

        <div className="space-y-8">
          {/* WordPress */}
          <div>
            <h3 id="wp" className="mb-2 text-xl font-medium">WordPress</h3>
            <div className="space-y-3">
              <Q q="Where do I paste the snippet in WordPress?">
                <ul className="list-disc pl-5">
                  <li>Use “Header & Footer” plugin or your theme’s “Footer Scripts” and paste before <code>&lt;/body&gt;</code>.</li>
                  <li>Full steps: <Link className="underline" href="/docs/install#wordpress">Install ▸ WordPress</Link>.</li>
                </ul>
              </Q>
              <Q q="It doesn’t appear on some pages—why?">
                <ul className="list-disc pl-5">
                  <li>Some page builders exclude global footer. Ensure the page template includes footer hooks.</li>
                </ul>
              </Q>
              <Q q="Can I add via GTM instead?">
                <ul className="list-disc pl-5">
                  <li>Yes—follow <Link className="underline" href="/docs/install#gtm">Install ▸ GTM</Link>.</li>
                </ul>
              </Q>
            </div>
          </div>

          {/* Webflow */}
          <div>
            <h3 id="webflow" className="mb-2 text-xl font-medium">Webflow</h3>
            <div className="space-y-3">
              <Q q="How do I add the code in Webflow?">
                <ul className="list-disc pl-5">
                  <li>Project Settings ▸ Custom Code ▸ Footer Code. Publish to all domains.</li>
                </ul>
              </Q>
              <Q q="Designer preview doesn’t show—normal?">
                <ul className="list-disc pl-5">
                  <li>Yes—publish first; the script loads on the published site.</li>
                </ul>
              </Q>
            </div>
          </div>

          {/* Shopify */}
          <div>
            <h3 id="shopify" className="mb-2 text-xl font-medium">Shopify</h3>
            <div className="space-y-3">
              <Q q="Where exactly in Shopify?">
                <ul className="list-disc pl-5">
                  <li>Online Store ▸ Themes ▸ Edit code ▸ <code>theme.liquid</code> (paste before <code>&lt;/body&gt;</code>).</li>
                </ul>
              </Q>
              <Q q="Does it work with Online Store 2.0?">
                <ul className="list-disc pl-5">
                  <li>Yes—use theme editor’s custom code or edit <code>theme.liquid</code>.</li>
                </ul>
              </Q>
            </div>
          </div>

          {/* Wix */}
          <div>
            <h3 id="wix" className="mb-2 text-xl font-medium">Wix</h3>
            <div className="space-y-3">
              <Q q="How to add on Wix?">
                <ul className="list-disc pl-5">
                  <li>Settings ▸ Advanced ▸ Custom Code ▸ Add Code to Pages (All) ▸ Body-End.</li>
                </ul>
              </Q>
              <Q q="Bubble is hidden under Wix chat—fix?">
                <ul className="list-disc pl-5">
                  <li>Switch Chatmadi to the other corner in <Link className="underline" href="/dashboard/widgets">Widget settings</Link> or raise z-index per troubleshooting.</li>
                </ul>
              </Q>
            </div>
          </div>

          {/* Squarespace */}
          <div>
            <h3 id="squarespace" className="mb-2 text-xl font-medium">Squarespace</h3>
            <div className="space-y-3">
              <Q q="Where to paste on Squarespace?">
                <ul className="list-disc pl-5">
                  <li>Settings ▸ Developer Tools ▸ Code Injection ▸ Footer.</li>
                </ul>
              </Q>
              <Q q="Not showing on a specific page?">
                <ul className="list-disc pl-5">
                  <li>Some pages override injection—use page-level code injection if needed.</li>
                </ul>
              </Q>
            </div>
          </div>

          {/* Next.js / React */}
          <div>
            <h3 id="nextjs" className="mb-2 text-xl font-medium">Next.js / React</h3>
            <div className="space-y-3">
              <Q q="How to include in Next.js?">
                <ul className="list-disc pl-5">
                  <li>Add the script in <code>app/(site)/layout.tsx</code> before <code>&lt;/body&gt;</code> or via <code>next/script</code> with <code>strategy="afterInteractive"</code>.</li>
                </ul>
              </Q>
              <Q q="CSR/SSR hydration issues?">
                <ul className="list-disc pl-5">
                  <li>Widget is independent (async). Ensure it’s injected once and not duplicated in nested layouts.</li>
                </ul>
              </Q>
            </div>
          </div>
        </div>
      </Section>

      {/* Final help */}
      <Section title="Need more help?">
        <ol className="list-decimal space-y-3 pl-5">
          <li>See the <Link className="underline" href="/docs/troubleshooting">Troubleshooting Guide</Link> for step-by-step fixes.</li>
          <li>New to Chatmadi? Start with <Link className="underline" href="/docs/install">Install</Link> then read the <Link className="underline" href="/docs/dashboard">Dashboard guide</Link>.</li>
        </ol>
      </Section>
    </div>
  );
}
