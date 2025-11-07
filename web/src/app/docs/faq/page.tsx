"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { breadcrumbJsonLd, toJson } from "@/lib/structured";

// -----------------------
// Data (categories + Q&As)
// -----------------------
type QA = { q: string; a: string };
type Cat = { id: string; title: string; items: QA[] };

const CATS: Cat[] = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      {
        q: "What is ChatMadi?",
        a: "ChatMadi is a lightweight WhatsApp chat widget for websites. It adds a floating bubble that opens WhatsApp with your business number and a pre-filled message. You can customize the look, choose languages, set business hours for off-hours replies, and track impressions/clicks in Analytics. Start at /docs/install, then visit the Dashboard for Widget settings and Templates."
      },
      {
        q: "What do I need before installing?",
        a: "You need your WhatsApp number in full international format (e.g., +91XXXXXXXXXX), access to your site’s HTML (or theme editor on WordPress/Webflow/Shopify), and your unique Widget ID from Dashboard → Overview. Copy the embed snippet from /docs/install and paste it right before </body>."
      },
      {
        q: "Where do I find my Widget ID?",
        a: "Open Dashboard → Overview. You’ll see your Widget ID and quick Copy buttons for Embed and Auto-trigger snippets. You can also confirm it in Dashboard → Widget settings. If you have multiple widgets, prefer the newest linked to your business."
      },
      {
        q: "Does ChatMadi work on all sites?",
        a: "Yes. It works on static HTML sites and popular platforms like WordPress, Webflow, Shopify, Wix, Squarespace, and Next.js. See /docs/install for platform-specific notes and /docs/troubleshooting if your theme blocks external scripts (CSP)."
      },
      {
        q: "Will it slow my website?",
        a: "No. The script loads asynchronously after the main page has rendered. It’s a small, cacheable file served by Vercel. You can verify load timing in your browser DevTools Network tab and in Lighthouse audits."
      },
      {
        q: "How do I test it quickly?",
        a: "Install the embed snippet, then open your site in an incognito window. You should see the floating bubble. Click it to confirm WhatsApp opens with your number and prefill. Also check Dashboard → Analytics to see impressions and clicks appear."
      }
    ]
  },

  {
    id: "install-setup",
    title: "Installation & setup",
    items: [
      {
        q: "Where exactly do I paste the embed code?",
        a: "Place the snippet just before the closing </body> tag in your site’s main layout or theme file. On WordPress, use theme header/footer injection or a code snippet plugin. On Shopify, edit theme.liquid. On Webflow, go to Project Settings → Custom Code → Footer."
      },
      {
        q: "How do I add Auto-trigger?",
        a: "Copy the Auto-trigger snippet from Dashboard → Overview and paste it after the main widget snippet. Auto-trigger can open the chat bubble automatically based on timing and simple rules. See /docs/dashboard → Widget behavior & customization."
      },
      {
        q: "How do I change the bubble color or position?",
        a: "Go to Dashboard → Widget settings. You can set theme color, bottom offset, side (left/right), icon style, call-to-action text, and more. Save your changes, then refresh your site to see the update."
      },
      {
        q: "Do I need to redeploy my site after changes?",
        a: "Usually no. Settings and templates are fetched dynamically. After saving in the Dashboard, reload your site page; the widget reads live config from the API. If a CDN caches your HTML aggressively, flush that cache."
      },
      {
        q: "What about Content Security Policy (CSP)?",
        a: "If your site uses CSP, allow the script origin (your Vercel domain) and WhatsApp links. See /docs/troubleshooting → CSP section for exact directives to add to script-src and connect-src."
      }
    ]
  },

  {
    id: "templates-triggers",
    title: "Templates & triggers",
    items: [
      {
        q: "What are templates?",
        a: "Templates are saved messages (e.g., Greeting, Off-hours, Sales) used by the widget and by your team for fast, consistent replies. Create them in Dashboard → Templates. Support multiple locales like en/hi/kn/ta with the same kind."
      },
      {
        q: "How do business hours affect templates?",
        a: "When a visitor pings you outside your business hours, the system picks an Off-hours template for the chosen locale (with fallback to English). During business hours, it prefers a Greeting template."
      },
      {
        q: "What are custom kinds?",
        a: "Besides system kinds (greeting, off_hours, etc.), you can add custom kinds like promo, upsell. Use Dashboard → Templates → Manage kinds to create or delete custom categories."
      },
      {
        q: "How do I test the template chooser?",
        a: "Use the endpoint shown in /docs/dashboard → Templates QA (Include inline business hours). For example: /api/templates/choose?wid=<id>&locale=en&h=11&m=15 to simulate business hours vs off-hours decisions."
      },
      {
        q: "What are triggers?",
        a: "Triggers are rules that auto-open the chat bubble (e.g., after X seconds, exit-intent, or specific pages). The basic auto-trigger snippet is provided on Dashboard → Overview. More advanced triggers are planned as future updates."
      }
    ]
  },

  {
    id: "languages",
    title: "Languages",
    items: [
      {
        q: "How is the user’s language chosen?",
        a: "The widget tries the requested locale first (e.g., ?locale=hi), then falls back: requested → site preference → English. If no template exists for the chosen kind in that locale, it uses a default message."
      },
      {
        q: "Can I force a locale?",
        a: "Yes. Pass ?locale=xx in your page URL or set an explicit preference in your site integration. For backend QA, call /api/templates/choose with a locale param to confirm template selection."
      },
      {
        q: "Which languages are supported out of the box?",
        a: "Docs and examples highlight English (en), Hindi (hi), Kannada (kn), and Tamil (ta). You can add any BCP-47 code and create matching templates; the chooser will honor them if present."
      }
    ]
  },

  {
    id: "business-hours",
    title: "Business hours",
    items: [
      {
        q: "How do I set business hours?",
        a: "Open Dashboard → Business hours. Define Mon–Sat windows and mark closed days. The chooser uses these ranges to switch between Greeting (open) and Off-hours (closed) automatically."
      },
      {
        q: "What timezone is used?",
        a: "You can set your business timezone (e.g., Asia/Kolkata). The chooser evaluates the local time in that timezone against your schedule when deciding off-hours vs greeting."
      },
      {
        q: "How do I QA hours quickly?",
        a: "Use the chooser endpoint with inline hours parameters as shown in /docs/dashboard → Templates QA. You can simulate 11:15 (open) vs 23:30 (closed) without changing saved hours."
      }
    ]
  },

  {
    id: "analytics",
    title: "Analytics",
    items: [
      {
        q: "What data do you track?",
        a: "Impressions (widget renders), Opens (user opens bubble), Closes, and Clicks (CTA). CTR is Clicks ÷ Impressions. See Dashboard → Analytics for daily totals and page breakdown."
      },
      {
        q: "How do I smoke-test analytics?",
        a: "Use the public endpoints documented in /docs/troubleshooting to post test events and confirm the dashboard updates. If numbers stay zero, verify env variables and that the admin key is configured."
      },
      {
        q: "Can I export analytics?",
        a: "Yes. Dashboard → Analytics → Export provides CSV download for selected periods. You can filter by day or page to analyze performance."
      }
    ]
  },

  {
    id: "billing",
    title: "Billing & plans",
    items: [
      {
        q: "Is there a free plan?",
        a: "Yes. We plan to publish a Free plan tier that lets you install and test the widget on your site. Follow the newsletter on the landing page and /docs/faq for plan details as they go live."
      },
      {
        q: "How do upgrades work?",
        a: "Use Dashboard → Billing to choose a plan. Upgrades take effect immediately; downgrades at the next cycle. Webhooks keep subscription status in sync, and features are gated accordingly."
      },
      {
        q: "Which payment methods are supported?",
        a: "Cards, UPI, and other popular options via our gateway. Invoices and tax details appear in your Billing page."
      }
    ]
  },

  {
    id: "privacy",
    title: "Privacy & security",
    items: [
      {
        q: "Do you store chat content?",
        a: "No, WhatsApp chats happen in WhatsApp. We only log widget events (impressions/opens/closes/clicks) and optional leads you intentionally submit. See the Privacy FAQ for details."
      },
      {
        q: "Is my data secure?",
        a: "We use Supabase with role-based access, server-side admin APIs where required, and Vercel for infrastructure. Sensitive environment variables are kept in Vercel project settings."
      }
    ]
  },

  {
    id: "troubleshooting",
    title: "Troubleshooting",
    items: [
      {
        q: "I pasted the code but the bubble doesn’t show.",
        a: "Check that you pasted the snippet before </body>, that your theme isn’t stripping scripts, and that your CSP allows our script origin. See /docs/troubleshooting → Rendering & CSP for exact fixes."
      },
      {
        q: "Clicks aren’t tracked.",
        a: "Open your browser console and confirm no network/API errors. Make sure SUPABASE_SERVICE_ROLE is set in Vercel. Use the smoke-test endpoints in /docs/troubleshooting to verify inserts."
      },
      {
        q: "Templates chooser always returns off_hours.",
        a: "Make sure business hours are saved and the timezone is correct. For QA, pass inline hours to /api/templates/choose as shown in /docs/dashboard → Templates QA."
      }
    ]
  },

  // Platform mini-FAQs
  {
    id: "platforms",
    title: "Platform mini-FAQs",
    items: [
      {
        q: "WordPress: Where do I paste the code?",
        a: "Use a header/footer injection plugin (e.g., Insert Headers and Footers) and paste the snippet into Footer. Or edit your theme’s footer.php and place it before </body>. See /docs/install for notes."
      },
      {
        q: "Webflow: What’s the right place for the snippet?",
        a: "Project Settings → Custom Code → Footer Code. Publish the site and check the live domain. If you use per-page custom code, prefer the global Footer so it loads on all pages."
      },
      {
        q: "Shopify: How do I edit theme.liquid?",
        a: "Online Store → Themes → Edit code → layout/theme.liquid. Paste the snippet before </body>. If using a JSON theme, ensure it’s the main layout file."
      },
      {
        q: "Wix/Squarespace: Does it work?",
        a: "Yes. Use code injection in site-wide footer or the custom code settings. If the platform sanitizes scripts, use the official code injection feature rather than raw HTML blocks."
      },
      {
        q: "Next.js: Any special steps?",
        a: "Add the snippet in app/layout.tsx (inside <body>, right before </body>). Use the /api/auto-trigger URL directly—no need to import the script at build time."
      }
    ]
  }
];

// Flatten for search & JSON-LD
const ALL: (QA & { cat: string; id: string })[] = CATS.flatMap((c) =>
  c.items.map((qa, i) => ({
    ...qa,
    cat: c.title,
    id: `${c.id}-${i}`
  }))
);

// -----------------------
// Page
// -----------------------
export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const filteredCats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATS;
    return CATS.map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          i.q.toLowerCase().includes(q) ||
          i.a.toLowerCase().includes(q)
      ),
    })).filter((c) => c.items.length > 0);
  }, [query]);

  // JSON-LD (explicit object to avoid helper typing conflicts)
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ALL.slice(0, 60).map((i) => ({
      "@type": "Question",
      "name": i.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": i.a.replace(/\s+/g, " ").trim()
      }
    }))
  };

  const crumbs = breadcrumbJsonLd([
    { name: "Docs", url: "https://chatmadi.com/docs" },
    { name: "FAQ", url: "https://chatmadi.com/docs/faq" },
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJson(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJson(faqLd) }} />

      <h1 className="mb-6 text-3xl font-bold">Frequently Asked Questions</h1>

      <p className="mb-4 text-slate-200">
        New to ChatMadi? Start with the <Link href="/docs" className="underline">Docs home</Link>, then see the{" "}
        <Link href="/docs/install" className="underline">Install guide</Link>, the{" "}
        <Link href="/docs/dashboard" className="underline">Dashboard guide</Link>, and{" "}
        <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link>.
      </p>

      {/* Search box */}
      <div className="mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQ (e.g., “business hours”, “shopify”, “templates”)"
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </div>

      {/* Categories + QAs (questions collapse/expand) */}
      <div className="space-y-10">
        {filteredCats.map((cat) => (
          <section key={cat.id} id={cat.id}>
            <h2 className="mb-4 text-2xl font-semibold">{cat.title}</h2>
            <div className="divide-y divide-slate-800 rounded border border-slate-800">
              {cat.items.map((qa, idx) => {
                const qid = `${cat.id}-${idx}`;
                const isOpen = !!open[qid];
                return (
                  <div key={qid} className="p-4">
                    <button
                      onClick={() => setOpen((s) => ({ ...s, [qid]: !s[qid] }))}
                      className="flex w-full items-center justify-between text-left"
                      aria-expanded={isOpen}
                      aria-controls={`${qid}-content`}
                    >
                      <span className="font-medium">{qa.q}</span>
                      <span className="ml-3 text-sm text-slate-400">{isOpen ? "Hide" : "Show"}</span>
                    </button>
                    {isOpen && (
                      <div id={`${qid}-content`} className="mt-3 text-slate-300">
                        <p className="leading-relaxed">
                          {qa.a}
                          {" "}
                          {qa.a.toLowerCase().includes("install") && (
                            <Link href="/docs/install" className="underline">Learn how to install</Link>
                          )}
                          {qa.a.toLowerCase().includes("dashboard") && (
                            <> — see the <Link href="/docs/dashboard" className="underline">Dashboard guide</Link></>
                          )}
                          {qa.a.toLowerCase().includes("troubleshooting") && (
                            <> — refer to <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link></>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 text-sm text-slate-400">
        Can’t find an answer? Check{" "}
        <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link> or start at{" "}
        <Link href="/docs" className="underline">Docs</Link>.
      </div>
    </div>
  );
}
