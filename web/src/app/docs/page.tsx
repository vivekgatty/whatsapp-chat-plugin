import Link from "next/link";
import { websiteJsonLd, orgJsonLd, breadcrumbJsonLd, toJson } from "@/lib/structured";

// NOTE: Keep existing metadata/generateMetadata in this file as-is (we're only adding JSON-LD scripts).

export default function DocsHome() {
  const SITE = "https://chatmadi.com";

  const jsonLd = [
    orgJsonLd({
      name: "ChatMadi",
      url: SITE,
      logo: SITE + "/og/chatmadi-og.png",
      sameAs: [
        // Add socials when ready
      ],
    }),
    websiteJsonLd({
      url: SITE,
      name: "ChatMadi",
      searchActionUrlTemplate: SITE + "/search?q={search_term_string}",
    }),
    breadcrumbJsonLd([
      { name: "Docs", url: SITE + "/docs" },
    ]),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* JSON-LD */}
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJson(block) }}
        />
      ))}

      <h1 className="mb-6 text-3xl font-bold">ChatMadi Documentation</h1>

      <p className="mb-4 text-slate-200">
        Welcome to the official <strong>ChatMadi WhatsApp Chat Plugin</strong> docs. Use these guides to install
        the widget, configure settings, create multilingual templates, and verify analytics. Start with{" "}
        <Link href="/docs/install" className="underline">Install</Link>, then visit{" "}
        <Link href="/docs/dashboard" className="underline">Dashboard</Link> for a button-by-button tour,
        check <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link> if anything looks off,
        and see <Link href="/docs/faq" className="underline">FAQ</Link> for quick answers.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold">Quick Links</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><Link href="/docs/install" className="underline">Install guide</Link></li>
        <li><Link href="/docs/dashboard" className="underline">Dashboard guide</Link></li>
        <li><Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link></li>
        <li><Link href="/docs/faq" className="underline">FAQ</Link></li>
      </ul>

      <h2 className="mt-10 mb-3 text-xl font-semibold">What is ChatMadi?</h2>
      <ul className="list-decimal space-y-2 pl-6">
        <li>A lightweight, production-ready WhatsApp chat bubble for websites.</li>
        <li>No-code install (copy/paste). Dev-friendly events & APIs when you need them.</li>
        <li>Multilingual templates + business-hours aware auto-replies.</li>
        <li>Built-in analytics: impressions, opens, closes, clicks, CTR.</li>
        <li>Works on static sites and modern frameworks (Next.js, WordPress, Webflow, etc.).</li>
      </ul>

      <h2 className="mt-10 mb-3 text-xl font-semibold">Next Steps</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>Go to <Link href="/docs/install" className="underline">Install</Link> and embed the widget.</li>
        <li>Open <Link href="/docs/dashboard" className="underline">Dashboard</Link> → Widget settings & Templates.</li>
        <li>Verify behavior with <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link>.</li>
        <li>Skim <Link href="/docs/faq" className="underline">FAQ</Link> for common questions.</li>
      </ol>
    </div>
  );
}
