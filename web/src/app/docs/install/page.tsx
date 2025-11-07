"use client";

import Link from "next/link";
import { useWid } from "@/lib/wid";
import { breadcrumbJsonLd, toJson } from "@/lib/structured";

export default function InstallDocs() {
  const [wid] = useWid();
  const W = wid || "YOUR_WIDGET_ID";

  const embedSnippet = `<script src="https://chatmadi.com/api/widget.js?wid=${W}"></script>`;
  const autoTriggerSnippet = `<script src="https://chatmadi.com/api/auto-trigger?wid=${W}"></script>`;

  // Breadcrumbs + HowTo JSON-LD
  const crumbs = breadcrumbJsonLd([
    { name: "Docs", url: "https://chatmadi.com/docs" },
    { name: "Install", url: "https://chatmadi.com/docs/install" },
  ]);

  const howtoLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Install ChatMadi WhatsApp chat widget",
    "description":
      "Add a floating WhatsApp bubble to your site. Copy your Widget ID, paste the embed code before the closing body tag, optionally add the auto-trigger snippet, and verify in Analytics.",
    "totalTime": "PT5M",
    "tool": [
      { "@type": "HowToTool", "name": "Website editor / theme editor" },
      { "@type": "HowToTool", "name": "Web browser" }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Open Dashboard and copy Widget ID",
        "url": "https://chatmadi.com/dashboard",
        "text": "Sign in to ChatMadi, go to the Dashboard Overview, and copy your unique Widget ID from the quick actions."
      },
      {
        "@type": "HowToStep",
        "name": "Paste the embed snippet",
        "text": "Open your site or theme editor and paste the ChatMadi widget script just before the closing </body> tag so it loads on all pages."
      },
      {
        "@type": "HowToStep",
        "name": "Optionally add auto-trigger",
        "text": "Paste the auto-trigger script (after the main snippet) to open the chat automatically with a simple rule."
      },
      {
        "@type": "HowToStep",
        "name": "Save, publish, and verify",
        "text": "Publish your site, open it in an incognito window, and confirm the bubble appears. Click it to test WhatsApp. Check Dashboard → Analytics for impressions/clicks."
      }
    ]
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJson(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJson(howtoLd) }} />

      <h1 className="mb-6 text-3xl font-bold">Install the WhatsApp Chat Widget</h1>
      <p className="mb-6 text-slate-200">
        New here? Start at the <Link href="/docs" className="underline">Docs home</Link>. After installation, continue to{" "}
        <Link href="/docs/dashboard" className="underline">Dashboard guide</Link>, review{" "}
        <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link>, and skim the{" "}
        <Link href="/docs/faq" className="underline">FAQ</Link>.
      </p>

      <h2 id="prerequisites" className="mb-3 text-2xl font-semibold">Prerequisites</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Your WhatsApp number in full international format (e.g., <strong>+91XXXXXXXXXX</strong>).</li>
        <li>Access to your site’s HTML or theme editor (WordPress/Webflow/Shopify/etc.).</li>
        <li>Your <strong>Widget ID</strong> from <Link href="/dashboard" className="underline">Dashboard → Overview</Link>.</li>
      </ol>

      <h2 id="quick-install" className="mt-8 mb-3 text-2xl font-semibold">Quick install (recommended)</h2>
      <h3 className="mb-2 text-xl font-medium">Step 1 — Copy your embed snippet</h3>
      <p className="mb-2 text-slate-300">Use your live Widget ID if you’re signed in. Otherwise, replace <code>YOUR_WIDGET_ID</code> manually.</p>
      <pre className="mb-4 overflow-x-auto rounded border border-slate-800 bg-slate-900 p-3 text-sm">
        <code>{embedSnippet}</code>
      </pre>

      <h3 className="mb-2 text-xl font-medium">Step 2 — Paste before the closing &lt;/body&gt; tag</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5">
        <li><strong>Plain HTML:</strong> Edit your base template, paste the snippet right before &lt;/body&gt;.</li>
        <li><strong>WordPress:</strong> Use a header/footer injection plugin or your theme’s Footer; paste before &lt;/body&gt;.</li>
        <li><strong>Shopify:</strong> <em>Online Store → Themes → Edit code → layout/theme.liquid</em>, paste before &lt;/body&gt;.</li>
        <li><strong>Webflow:</strong> <em>Project Settings → Custom Code → Footer Code</em>, publish your site.</li>
        <li><strong>Wix/Squarespace:</strong> Use site-wide code injection in Footer.</li>
        <li><strong>Next.js (App Router):</strong> Place inside <code>app/layout.tsx</code> just before &lt;/body&gt;.</li>
      </ul>

      <h3 className="mb-2 text-xl font-medium">Optional — Auto-trigger</h3>
      <p className="mb-2 text-slate-300">
        Add a simple rule to auto-open the widget (e.g., after a delay). Paste this <em>after</em> the main snippet:
      </p>
      <pre className="mb-4 overflow-x-auto rounded border border-slate-800 bg-slate-900 p-3 text-sm">
        <code>{autoTriggerSnippet}</code>
      </pre>
      <p className="mb-6 text-slate-300">
        Learn more: <Link href="/docs/dashboard#widget-behavior" className="underline">Widget behavior & customization</Link>.
      </p>

      <h2 id="verify" className="mt-8 mb-3 text-2xl font-semibold">Verify installation</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Open your site in an incognito window. The floating bubble should appear.</li>
        <li>Click the bubble; WhatsApp (app/web) should open with your number and prefilled text.</li>
        <li>Check <Link href="/dashboard/analytics" className="underline">Dashboard → Analytics</Link> for impressions and clicks.</li>
      </ol>

      <h2 id="platform-notes" className="mt-8 mb-3 text-2xl font-semibold">Platform notes</h2>
      <h3 className="mb-2 text-xl font-medium">WordPress</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5">
        <li>Prefer a proven “Header & Footer Code” plugin for site-wide injection.</li>
        <li>Some page builders may sanitize scripts in content blocks — inject at theme/footer level instead.</li>
      </ul>

      <h3 className="mb-2 text-xl font-medium">Shopify</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5">
        <li>Edit <code>layout/theme.liquid</code> and paste before &lt;/body&gt; to load on all templates.</li>
        <li>If your theme has multiple layouts, ensure you add it to the primary one.</li>
      </ul>

      <h3 className="mb-2 text-xl font-medium">Webflow</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5">
        <li>Project Settings → Custom Code → Footer Code.</li>
        <li>Publish to the live domain and test there (Designer preview won’t run site-level code).</li>
      </ul>

      <h2 id="csp" className="mt-8 mb-3 text-2xl font-semibold">CSP (Content Security Policy)</h2>
      <p className="mb-2 text-slate-300">
        If your site uses CSP, allow the widget script origin and WhatsApp links. See{" "}
        <Link href="/docs/troubleshooting#csp" className="underline">Troubleshooting → CSP</Link> for exact directives.
      </p>

      <h2 id="next-steps" className="mt-8 mb-3 text-2xl font-semibold">Next steps</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Customize look & behavior in <Link href="/dashboard/widgets" className="underline">Widget settings</Link>.</li>
        <li>Add multilingual greetings/off-hours in <Link href="/dashboard/templates" className="underline">Templates</Link>.</li>
        <li>Confirm real traffic in <Link href="/dashboard/analytics" className="underline">Analytics</Link>.</li>
        <li>Stuck? Visit <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link> or the <Link href="/docs/faq" className="underline">FAQ</Link>.</li>
      </ul>
    </div>
  );
}
