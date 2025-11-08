import type { Metadata } from "next";
import Link from "next/link";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

/** Invisible helper that runs only on the landing page.
 * If URL is /?next=... and the user is signed in, forward to that internal route immediately.
 */
function NextHop() {
  // this component renders only on the client
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (!next) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        try {
          const target = decodeURIComponent(next);
          // guard against protocol/host injection
          const safe = target.startsWith("/") ? target : "/dashboard/overview";
          router.replace(safe);
        } catch {
          router.replace("/dashboard/overview");
        }
      }
    });
  }, [router]);

  return null;
}

export const metadata: Metadata = {
  title: "ChatMadi — WhatsApp Chat Widget for Websites (₹199/month)",
  description:
    "Add a fast, privacy-friendly WhatsApp chat bubble to your website. Copy–paste install, multilingual templates, off-hours auto-replies, and built-in analytics — all for ₹199/month.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ChatMadi — WhatsApp Chat Widget (₹199/month)",
    description:
      "Install in minutes. Multilingual templates, off-hours logic, basic analytics. Start with your email to get a magic link.",
    url: "https://chatmadi.com/",
    siteName: "ChatMadi",
    type: "website",
    images: [{ url: "/og/chatmadi-og.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatMadi — WhatsApp Chat Widget",
    description:
      "Copy–paste install, multilingual templates, off-hours replies, basic analytics.",
    images: ["/og/chatmadi-og.png"],
  },
};

function DotItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 leading-relaxed">
      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-sky-500" />
      <span>{children}</span>
    </li>
  );
}

export default function Home() {
  // JSON-LD: Organization + SoftwareApplication + WebSite SearchAction
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ChatMadi",
      url: "https://chatmadi.com/",
      sameAs: [],
      logo: "https://chatmadi.com/og/chatmadi-og.png",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ChatMadi — WhatsApp Chat Widget",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://chatmadi.com/",
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: "199.00",
        category: "Subscription",
      },
      description:
        "WhatsApp chat widget with multilingual templates, off-hours auto-replies, and analytics.",
      publisher: { "@type": "Organization", name: "ChatMadi" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ChatMadi",
      url: "https://chatmadi.com/",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://chatmadi.com/docs/faq?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      {/* NEXT-HOP: only affects /?next=... for signed-in users */}
      <NextHop />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* HERO */}
      <section id="hero" className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Add WhatsApp to your website in minutes.
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              A lightweight chat bubble with multilingual templates, off-hours auto-replies, and built-in analytics. No bloat. No hassle.{" "}
              <strong>₹199/month</strong>.
            </p>

            {/* Email → /dashboard (magic link flow continues there) */}
            <form
              className="mt-6 flex max-w-md items-center gap-2"
              action="/dashboard"
              method="get"
              aria-label="Start with your email to receive a magic link"
            >
              <input
                name="email"
                required
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base outline-none ring-0 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium hover:bg-sky-500"
              >
                Get magic link
              </button>
            </form>

            <p className="mt-3 text-xs text-slate-400">
              We’ll email you a secure sign-in link. No password needed. Already signed in?{" "}
              <Link href="/dashboard/overview" className="underline">Go to Dashboard</Link>.
            </p>

            {/* Trust bullets (no internal links for unauth users) */}
            <ul className="mt-6 grid gap-2 text-slate-200 sm:grid-cols-2">
              <DotItem>Copy–paste install for WordPress, Webflow, Shopify, Wix, Squarespace, Next.js, or plain HTML.</DotItem>
              <DotItem>Precision control with Templates, Languages, and Business Hours.</DotItem>
              <DotItem>Privacy-friendly, fast, and accessible. Read the performance tips.</DotItem>
              <DotItem>Built-in Analytics: impressions, opens, clicks — no extra setup.</DotItem>
            </ul>
          </div>

          {/* Value box */}
          <div className="rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold">Why teams pick ChatMadi</h2>
            <ul className="mt-3 space-y-2 text-slate-200">
              <DotItem>Launch today with a 1-line embed. No developer hand-holding needed.</DotItem>
              <DotItem>Speak the user’s language automatically (EN/HI/KN/TA) with smart fallbacks.</DotItem>
              <DotItem>Send friendly off-hours replies and never lose a lead at night or weekends.</DotItem>
              <DotItem>Track what matters: bubble views, opens, clicks — optimize CTA copy with data.</DotItem>
            </ul>
            <div className="mt-5">
              <Link href="/docs" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
                Explore the Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / BADGES */}
      <section id="proof" className="mx-auto mt-14 max-w-6xl">
        <div className="rounded-xl border border-slate-800 p-4 text-center text-sm text-slate-400">
          Trusted by lean teams who want conversions without page bloat. Built for speed, clarity, and results.
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-700 p-5">
            <div className="text-sm font-semibold text-sky-400">Step 1</div>
            <h3 className="mt-1 font-medium">Install the snippet</h3>
            <p className="mt-2 text-slate-300">
              Copy the embed code from Widget settings or follow the Install Guide. Paste it before{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5">{"</body>"}</code> and publish.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 p-5">
            <div className="text-sm font-semibold text-sky-400">Step 2</div>
            <h3 className="mt-1 font-medium">Add your messages</h3>
            <p className="mt-2 text-slate-300">
              Create Templates for greetings & off-hours. Set Languages and Business Hours.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 p-5">
            <div className="text-sm font-semibold text-sky-400">Step 3</div>
            <h3 className="mt-1 font-medium">Measure & improve</h3>
            <p className="mt-2 text-slate-300">
              Use Analytics to track impressions, opens, and clicks. Iterate on copy, timing, and triggers.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS */}
      <section id="features" className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-2xl font-semibold">Everything you need to convert</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-700 p-5">
            <h3 className="font-medium">Multilingual & off-hours</h3>
            <ul className="mt-2 space-y-2 text-slate-300">
              <DotItem>Auto-select locale with smart fallbacks.</DotItem>
              <DotItem>Configure Mon–Sat windows, Sunday closed, and holidays.</DotItem>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-700 p-5">
            <h3 className="font-medium">Copy–paste developer experience</h3>
            <ul className="mt-2 space-y-2 text-slate-300">
              <DotItem>Embed + auto-trigger buttons in Widget settings.</DotItem>
              <DotItem>Production tips: CSP, placement, QA checks.</DotItem>
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-2xl font-semibold">Simple pricing</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-sky-700 bg-sky-950/30 p-6 md:col-span-2">
            <div className="text-sm font-semibold text-sky-300">Starter</div>
            <div className="mt-1 flex items-end gap-1">
              <div className="text-4xl font-bold">₹199</div>
              <div className="pb-1 text-slate-400">/month</div>
            </div>
            <ul className="mt-4 space-y-2 text-slate-200">
              <DotItem>WhatsApp chat bubble (fast, lightweight)</DotItem>
              <DotItem>Multilingual templates (EN/HI/KN/TA)</DotItem>
              <DotItem>Off-hours logic + greetings</DotItem>
              <DotItem>Basic analytics (impressions, opens, clicks)</DotItem>
              <DotItem>Install docs & troubleshooting support</DotItem>
            </ul>
            <form className="mt-6 flex max-w-md items-center gap-2" action="/dashboard" method="get">
              <input
                name="email"
                required
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base outline-none ring-0 placeholder:text-slate-500"
              />
              <button type="submit" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium hover:bg-sky-500">
                Get magic link
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-400">
              Passwordless sign-in. Change plans anytime.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 p-6">
            <div className="text-sm font-semibold text-slate-300">Pro</div>
            <div className="mt-1 text-2xl font-bold text-slate-400">Coming soon</div>
            <ul className="mt-4 space-y-2 text-slate-400">
              <DotItem>Advanced targeting</DotItem>
              <DotItem>Team seats & roles</DotItem>
              <DotItem>Exports & webhooks</DotItem>
            </ul>
            <div className="mt-6">
              <span className="rounded-xl border border-slate-700 px-5 py-3 text-sm opacity-60">
                Learn more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto mt-16 max-w-6xl">
        <div className="rounded-2xl border border-slate-700 p-6 text-center">
          <h2 className="text-2xl font-semibold">Ready to turn visitors into WhatsApp conversations?</h2>
          <p className="mt-2 text-slate-300">
            Start with your email — we’ll send a magic link. Install in minutes; measure in hours.
          </p>
          <form className="mx-auto mt-4 flex max-w-md items-center gap-2" action="/dashboard" method="get">
            <input
              name="email"
              required
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base outline-none ring-0 placeholder:text-slate-500"
            />
            <button type="submit" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium hover:bg-sky-500">
              Get magic link
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
