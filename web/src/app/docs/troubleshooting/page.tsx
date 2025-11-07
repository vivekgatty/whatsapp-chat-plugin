import Link from "next/link";
import { Section } from "@/components/docs";

export const metadata = {
  title: "Troubleshooting Guide | Chatmadi Docs",
  description:
    "Step-by-step fixes for common issues: install, WhatsApp opening, auto-trigger, multilingual templates, business hours, analytics, CSP/CORS, layout, platform-specific notes, and smoke tests.",
};

export default function TroubleshootingDocs() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 id="troubleshooting" className="mb-6 text-3xl font-semibold">
        Troubleshooting Guide
      </h1>

      <ul className="mb-8 list-decimal space-y-2 pl-5 text-slate-200">
        <li>
          Use this as a checklist when something doesn’t look right. Each section links to{" "}
          <Link className="underline" href="/docs/install">Install</Link>,{" "}
          <Link className="underline" href="/docs/dashboard">Dashboard</Link>, and key API endpoints for quick tests.
        </li>
        <li>
          Prefer running the smoke tests in <Link className="underline" href="#smoke-tests">§ Smoke tests</Link> to
          isolate whether an issue is your site, network, or configuration.
        </li>
      </ul>

      {/* A. Bubble not showing */}
      <Section title="A) Bubble does not appear">
        <h2 id="bubble-missing" className="sr-only">Bubble does not appear</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Confirm the snippet is pasted in the right place.</strong> Paste the embed from{" "}
            <Link className="underline" href="/docs/install">Install</Link> just before{" "}
            <code>&lt;/body&gt;</code>. If using a builder (WordPress/Webflow/Wix/Squarespace/Shopify/GTM), follow the
            platform note on the <Link className="underline" href="/docs/install#platforms">Install ▸ Platforms</Link>{" "}
            section exactly—many editors have separate footer fields.
          </li>
          <li>
            <strong>Verify the correct Widget ID.</strong> The copied code must include your active ID from{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link>. Re-copy to avoid typos or
            trailing spaces. If you have multiple sites, ensure each one uses its own ID.
          </li>
          <li>
            <strong>Check browser DevTools ▸ Network.</strong> Reload and confirm{" "}
            <code>/api/widget.js?wid=…</code> returns <code>200</code>. If blocked or 404, the path is wrong or a proxy
            is interfering. If your CSP is strict, see{" "}
            <Link className="underline" href="#csp-cors">§ CSP / CORS</Link>.
          </li>
          <li>
            <strong>Rule out extensions and ad blockers.</strong> Try an incognito window with extensions off. Some
            blockers hide any “chat” UI. If it appears in incognito, advise visitors to allowlist or use a safer name
            for the container element (advanced).
          </li>
          <li>
            <strong>Resolve z-index or overlay conflicts.</strong> If the bubble exists but sits behind other UI, add a
            tiny override on your site:
            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs"><code>{`/* Optional site-side fix */
#chatmadi-bubble-container { position: fixed !important; z-index: 2147483000 !important; }`}</code></pre>
          </li>
          <li>
            <strong>Single Page Apps (React/Vue/Next/Nuxt).</strong> Paste the snippet outside your framework’s root so
            reloads don’t duplicate/destroy the node. If using SSR (Next.js), keep it in the HTML body, not inside a
            component that re-renders on each route.
          </li>
          <li>
            <strong>GTM users.</strong> Use a “Custom HTML” tag, trigger on All Pages, and ensure Consent settings allow
            “ad_storage=granted” if your CMP blocks tags by default. Publish the GTM container after changes.
          </li>
        </ol>
      </Section>

      {/* B. WhatsApp not opening */}
      <Section title="B) WhatsApp does not open (or opens incorrectly)">
        <h2 id="whatsapp-open" className="sr-only">WhatsApp does not open</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Confirm phone format (E.164).</strong> Set your number in{" "}
            <Link className="underline" href="/dashboard/profile">Profile</Link> using full international format
            (e.g., <code>+91XXXXXXXXXX</code>). Missing the <code>+</code> or country code will break the deep link.
          </li>
          <li>
            <strong>Desktop vs. mobile behavior.</strong> Desktop opens WhatsApp Web; mobile opens the app. If WhatsApp
            Web is disabled by a firewall or company policy, the link may appear unresponsive—try a mobile device.
          </li>
          <li>
            <strong>Popup or navigation blockers.</strong> iOS Safari may block if the user interaction is unclear.
            Keep the open action bound to a direct click (the default bubble is fine).
          </li>
          <li>
            <strong>Prefill message issues.</strong> Remove special characters to rule out encoding problems. Keep it
            short; long prefill messages can be truncated by the OS/app.
          </li>
          <li>
            <strong>Multiple numbers or overrides.</strong> If you pass a number via data attributes or a custom button,
            verify it matches your canonical format in <Link className="underline" href="/dashboard/profile">Profile</Link>.
          </li>
        </ol>
      </Section>

      {/* C. Auto-trigger */}
      <Section title="C) Auto-trigger doesn’t fire">
        <h2 id="auto-trigger" className="sr-only">Auto-trigger doesn’t fire</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Include the optional snippet.</strong> Copy the Auto-trigger block from{" "}
            <Link className="underline" href="/docs/install#auto-trigger">Install ▸ Auto-trigger</Link>. Without it,
            the chat never opens automatically.
          </li>
          <li>
            <strong>Start gently.</strong> Use a clear rule (e.g., “open after 10s on home”). Aggressive rules on every
            page can be suppressed by browsers or annoy users; measure impact in{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>.
          </li>
          <li>
            <strong>Console check.</strong> Open DevTools ▸ Console to confirm no JavaScript errors block execution.
          </li>
        </ol>
      </Section>

      {/* D. Templates & hours */}
      <Section title="D) Wrong message chosen (greeting vs off-hours, or wrong language)">
        <h2 id="templates-hours" className="sr-only">Wrong message chosen</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Validate with the API first.</strong> Open{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> and click the{" "}
            <em>open</em> link in any row to see{" "}
            <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link> results. This shows
            decision details: time zone, on/off hours, and chosen locale.
          </li>
          <li>
            <strong>Business hours set correctly?</strong> In{" "}
            <Link className="underline" href="/dashboard/hours">Business hours</Link>, set Mon–Sat windows, closed days,
            and the proper time zone. To simulate quickly, add <code>h</code>/<code>m</code> and inline hours in the URL
            (example pattern): <code>?wid=…&amp;locale=en&amp;h=11&amp;m=15&amp;mon=10:00-18:00&amp;sun=closed</code>.
          </li>
          <li>
            <strong>Locale fallback unexpected?</strong> Ensure you actually have templates for the requested language
            under <Link className="underline" href="/dashboard/templates">Templates</Link>. If missing, the system falls
            back to English/default. Use <em>Manage kinds</em> for any custom types.
          </li>
          <li>
            <strong>Message still wrong?</strong> Re-run the QA with “Include inline business hours” enabled to rule
            out hours storage issues and compare the API response.
          </li>
        </ol>
      </Section>

      {/* E. Analytics */}
      <Section title="E) Analytics show zeros (or fewer events than expected)">
        <h2 id="analytics-zeros" className="sr-only">Analytics zeros</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Confirm the widget actually loaded.</strong> If <code>/api/widget.js</code> didn’t run, no events
            will be sent. Revisit <Link className="underline" href="/docs/install">Install</Link> and{" "}
            <Link className="underline" href="#bubble-missing">§ Bubble does not appear</Link>.
          </li>
          <li>
            <strong>DevTools ▸ Network.</strong> Trigger the chat and verify <code>POST /api/analytics</code> returns{" "}
            <code>200</code>. If blocked by ad/cookie consent tools, allow this endpoint and republish your settings.
          </li>
          <li>
            <strong>Self-hosting only (advanced).</strong> If you deployed your own backend and see <em>500s</em>, check
            environment variables and DB permissions. A missing service role or incorrect table/column names will
            prevent writes.
          </li>
          <li>
            <strong>Cross-check with a smoke test.</strong> See <Link className="underline" href="#smoke-tests">§ Smoke tests</Link>.
            If the API accepts events but the dashboard stays empty, confirm the correct Widget ID is selected on{" "}
            <Link className="underline" href="/dashboard/analytics">Analytics</Link>.
          </li>
        </ol>
      </Section>

      {/* F. Layout */}
      <Section title="F) Layout, overlap, or visibility issues">
        <h2 id="layout-issues" className="sr-only">Layout issues</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Move the bubble.</strong> Switch left/right in{" "}
            <Link className="underline" href="/dashboard/widgets">Widget settings</Link> to avoid language pickers,
            cookie banners, or “back to top” buttons.
          </li>
          <li>
            <strong>Raise z-index.</strong> If other sticky elements cover the bubble, apply a CSS override as shown in{" "}
            <Link className="underline" href="#bubble-missing">§ A.5</Link>.
          </li>
          <li>
            <strong>Mobile safe area.</strong> On devices with home indicator bars, verify the bubble sits above the
            safe area; the script handles this by default, but test on a tall page and on iOS/Android.
          </li>
        </ol>
      </Section>

      {/* G. Performance */}
      <Section title="G) Performance considerations">
        <h2 id="performance" className="sr-only">Performance</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Async by default.</strong> The loader is tiny and async; it won’t block rendering. If you see a
            delay, check for duplicate snippets or third-party conflicts.
          </li>
          <li>
            <strong>Avoid duplicates.</strong> Ensure the snippet is included exactly once (GTM + hardcoded can double
            load). Use DevTools ▸ Elements to confirm a single container node.
          </li>
        </ol>
      </Section>

      {/* H. Platform specifics */}
      <Section title="H) Platform-specific notes (quick checks)">
        <h2 id="platforms" className="sr-only">Platform specifics</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>WordPress.</strong> Use a footer injection plugin or your theme’s “Footer Scripts”. Don’t paste
            inside the post editor. Clear caches (plugin/CDN) after publishing.
          </li>
          <li>
            <strong>Webflow.</strong> Project Settings ▸ <em>Custom Code ▸ Footer Code</em>. Publish to the domain, not
            just staging.
          </li>
          <li>
            <strong>Wix / Squarespace.</strong> Use the global footer/custom code area. Some plans restrict custom HTML—
            upgrade if the field is missing.
          </li>
          <li>
            <strong>Shopify.</strong> <code>theme.liquid</code>, paste before <code>&lt;/body&gt;</code>. If using a
            theme app block, confirm it loads across templates.
          </li>
          <li>
            <strong>React / Next / Vue / Nuxt.</strong> Put the snippet in the HTML shell (e.g., Next’s{" "}
            <code>app/root layout &lt;body&gt;</code>) rather than inside a component that re-renders per route.
          </li>
          <li>
            <strong>GTM.</strong> Custom HTML tag, All Pages trigger, publish container, and ensure consent doesn’t
            suppress the tag.
          </li>
        </ol>
      </Section>

      {/* I. CSP / CORS */}
      <Section title="I) Content-Security-Policy (CSP) & CORS">
        <h2 id="csp-cors" className="sr-only">CSP & CORS</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Minimal directives (example).</strong> If you use a strict CSP, allow the loader and API:
            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs"><code>{`script-src 'self' chatmadi.com;
connect-src 'self' chatmadi.com;
img-src 'self' data:;
style-src 'self' 'unsafe-inline'; /* if your site already allows inline styles */`}</code></pre>
            Adjust the domain(s) based on your deployment. If a policy blocks the script, the bubble won’t render.
          </li>
          <li>
            <strong>CORS errors in console?</strong> These usually indicate a proxy/CDN rewrite. Ensure requests to
            <code>/api/widget.js</code>, <code>/api/analytics</code>, and <code>/api/track-lead</code> pass through
            untouched.
          </li>
        </ol>
      </Section>

      {/* J. Leads & webhooks */}
      <Section title="J) Leads & webhooks">
        <h2 id="leads-webhooks" className="sr-only">Leads & webhooks</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Leads appear but webhook not firing?</strong> Recheck the webhook URL in your integration page (if
            enabled). The receiver must return <code>2xx</code>. Use a request bin to confirm deliveries.
          </li>
          <li>
            <strong>No leads at all?</strong> Ensure your pre-chat is enabled and minimal (name + message). Heavy forms
            reduce completion. See <Link className="underline" href="/docs/dashboard#profile">Profile</Link> for number
            format and <Link className="underline" href="/dashboard/widgets">Widget settings</Link> for pre-chat toggles.
          </li>
        </ol>
      </Section>

      {/* K. HTTP errors */}
      <Section title="K) Common HTTP/API errors & quick fixes">
        <h2 id="http-errors" className="sr-only">HTTP errors</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>400 Bad Request.</strong> Usually missing <code>wid</code> or invalid params on{" "}
            <Link className="underline" href="/api/templates/choose">/api/templates/choose</Link>. Rebuild the URL from{" "}
            <Link className="underline" href="/dashboard/templates/qa">Templates QA</Link> to copy a known-good pattern.
          </li>
          <li>
            <strong>403/404.</strong> Path or domain mismatch. Confirm you’re calling the correct host and route. CDNs
            can rewrite <code>/api/*</code>—allow these paths.
          </li>
          <li>
            <strong>429 Too Many Requests.</strong> Back off your QA scripts; add small delays between calls.
          </li>
          <li>
            <strong>5xx.</strong> Temporary backend error or custom deployment misconfig. Retry and check{" "}
            <Link className="underline" href="#smoke-tests">§ Smoke tests</Link>.
          </li>
        </ol>
      </Section>

      {/* Smoke tests */}
      <Section title="L) Smoke tests (copy, run, verify)">
        <h2 id="smoke-tests" className="sr-only">Smoke tests</h2>
        <ol className="list-decimal space-y-4 pl-5">
          <li>
            <strong>Analytics event.</strong> Open this in your browser console (adjust <code>WID</code>):
            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs"><code>{`fetch('/api/analytics', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ wid: '<WID>', event: 'widget_view', meta: { referrer: location.href } })
}).then(r => r.json()).then(console.log).catch(console.error);`}</code></pre>
            Then check <Link className="underline" href="/dashboard/analytics">Analytics</Link> to see the count rise.
          </li>
          <li>
            <strong>Track a lead (quick).</strong> Use a minimal payload to ensure writes succeed:
            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs"><code>{`fetch('/api/track-lead?wid=<WID>', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ name: 'QA Test', message: 'Hello from Troubleshooting page', source: 'docs-smoke' })
}).then(r => r.json()).then(console.log).catch(console.error);`}</code></pre>
          </li>
          <li>
            <strong>Choose API (greeting vs off-hours).</strong> Replace <code>&lt;WID&gt;</code> and try both links:
            <div className="mt-2 space-y-2">
              <div>
                <code className="break-all">/api/templates/choose?wid=&lt;WID&gt;&amp;locale=en&amp;h=11&amp;m=15&amp;mon=10:00-18:00&amp;sun=closed</code>
              </div>
              <div>
                <code className="break-all">/api/templates/choose?wid=&lt;WID&gt;&amp;locale=en&amp;h=23&amp;m=30</code>
              </div>
            </div>
            Expect <code>kind=greeting</code> at 11:15 (business hours) and <code>kind=off_hours</code> at 23:30.
          </li>
        </ol>
      </Section>

      {/* Need help */}
      <Section title="M) Still stuck? Share exact details for fastest help">
        <h2 id="support" className="sr-only">Still stuck</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Include these in your message:</strong> site URL, your Widget ID (last 6 chars), what you expected,
            what you saw, browser + device, and any console/network screenshots (<code>/api/widget.js</code>,{" "}
            <code>/api/analytics</code>, <code>/api/track-lead</code>, <code>/api/templates/choose</code>).
          </li>
          <li>
            <strong>Link the relevant doc section.</strong> For example, “Issue matches{" "}
            <Link className="underline" href="#bubble-missing">§ A</Link> and{" "}
            <Link className="underline" href="#csp-cors">§ I</Link>” so we can jump straight to likely causes.
          </li>
        </ol>
      </Section>
    </div>
  );
}
