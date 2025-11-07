import Link from "next/link";
import Script from "next/script";
import { Section } from "@/components/docs";

export const metadata = {
  title: "FAQ — Chatmadi WhatsApp Chat Plugin",
  description:
    "Complete FAQ for Chatmadi: basics, install, widget behavior, templates, languages, business hours, auto-trigger, analytics, leads, billing, security, API, and platform-specific guides.",
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
              if(!show) d.open = false; // collapse hidden items
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
        </div>
      </Section>

      {/* B) Install */}
      <Section title="B) Install & Setup">
        <h2 id="install" className="sr-only">Install & Setup</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* C) Widget Behavior */}
      <Section title="C) Widget Behavior">
        <h2 id="widget" className="sr-only">Widget Behavior</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* D) Templates & Languages */}
      <Section title="D) Templates & Languages">
        <h2 id="templates" className="sr-only">Templates & Languages</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* E) Business Hours */}
      <Section title="E) Business Hours">
        <h2 id="hours" className="sr-only">Business Hours</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* F) Auto-trigger */}
      <Section title="F) Auto-trigger">
        <h2 id="trigger" className="sr-only">Auto-trigger</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* G) Analytics & Leads */}
      <Section title="G) Analytics & Leads">
        <h2 id="analytics" className="sr-only">Analytics & Leads</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* H) Plans & Billing */}
      <Section title="H) Plans & Billing">
        <h2 id="billing" className="sr-only">Plans & Billing</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* I) Security */}
      <Section title="I) Security, Privacy & Compliance">
        <h2 id="security" className="sr-only">Security, Privacy & Compliance</h2>
        <div className="space-y-4">
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
        </div>
      </Section>

      {/* J) Developers & API */}
      <Section title="J) Developers & API">
        <h2 id="api" className="sr-only">Developers & API</h2>
        <div className="space-y-4">
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
              <li>Use <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> and open each “link”; change <code>locale</code>, <code>h</code>, and <code>m</code> to simulate.</li>
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
