import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatMadi — WhatsApp Chat Widget for Websites (₹199/month)",
  description:
    "Add a fast, privacy-friendly WhatsApp chat bubble to your website. Copy–paste install, multilingual messages, off-hours auto-replies, and built-in analytics — all for ₹199/month.",
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
      "Copy–paste install, multilingual messages, off-hours replies, basic analytics.",
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
  // JSON-LD kept minimal (no internal URLs for search actions)
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
        "WhatsApp chat widget with multilingual messages, off-hours auto-replies, and lightweight analytics.",
      publisher: { "@type": "Organization", name: "ChatMadi" },
    },
  ];

  return (
    <main className="px-4 sm:px-6 lg:px-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* FULL-BLEED HERO */}
      <section
        id="hero"
        className="mx-auto flex min-h-screen max-w-6xl flex-col items-start justify-center py-8"
      >
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Add WhatsApp to
          <br />
          your website in
          <br />
          minutes.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          A lightweight chat bubble with multilingual messages, off-hours
          auto-replies, and built-in analytics. No bloat. No hassle.{" "}
          <strong>₹199/month</strong>.
        </p>

        {/* Email → /dashboard (magic link continues there) */}
        <form
          className="mt-8 flex w-full max-w-md items-center gap-2"
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
            Get magic
            <br />
            link
          </button>
        </form>

        <p className="mt-3 text-xs text-slate-400">
          We’ll email you a secure sign-in link. No password needed. Already
          signed in? Go to your dashboard tab from your email link.
        </p>

        {/* Trust bullets (text-only, no internal links) */}
        <ul className="mt-10 grid gap-3 text-slate-200 sm:grid-cols-2">
          <DotItem>
            Copy–paste install for WordPress, Webflow, Shopify, Wix,
            Squarespace, Next.js, or plain HTML.
          </DotItem>
          <DotItem>
            Precision control with templates, languages, and business hours.
          </DotItem>
          <DotItem>Privacy-friendly, fast, and accessible.</DotItem>
          <DotItem>
            Built-in analytics: impressions, opens, clicks — no extra setup.
          </DotItem>
        </ul>
      </section>

      {/* VALUE PROPS */}
      <section id="why" className="mx-auto mt-8 max-w-6xl">
        <div className="rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold">Why teams pick ChatMadi</h2>
          <ul className="mt-3 space-y-2 text-slate-200">
            <DotItem>Launch today with a 1-line embed.</DotItem>
            <DotItem>
              Speak the user’s language automatically (EN/HI/KN/TA) with smart
              fallbacks.
            </DotItem>
            <DotItem>
              Send friendly off-hours replies and never lose a lead at night or
              weekends.
            </DotItem>
            <DotItem>
              Track what matters: bubble views, opens, clicks — optimize CTA
              copy with data.
            </DotItem>
          </ul>
        </div>
      </section>

      {/* SIMPLE PRICING (no links) */}
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
              <DotItem>Multilingual messages (EN/HI/KN/TA)</DotItem>
              <DotItem>Off-hours logic + greetings</DotItem>
              <DotItem>Basic analytics (impressions, opens, clicks)</DotItem>
              <DotItem>Install guidance and troubleshooting tips</DotItem>
            </ul>

            <form
              className="mt-6 flex max-w-md items-center gap-2"
              action="/dashboard"
              method="get"
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

            <p className="mt-2 text-xs text-slate-400">
              Passwordless sign-in. Change plans anytime.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 p-6">
            <div className="text-sm font-semibold text-slate-300">Pro</div>
            <div className="mt-1 text-2xl font-bold text-slate-400">
              Coming soon
            </div>
            <ul className="mt-4 space-y-2 text-slate-400">
              <DotItem>Advanced targeting</DotItem>
              <DotItem>Team seats & roles</DotItem>
              <DotItem>Exports & webhooks</DotItem>
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" className="mx-auto my-16 max-w-6xl">
        <div className="rounded-2xl border border-slate-700 p-6 text-center">
          <h2 className="text-2xl font-semibold">
            Ready to turn visitors into WhatsApp conversations?
          </h2>
          <p className="mt-2 text-slate-300">
            Start with your email — we’ll send a magic link. Install in minutes;
            measure in hours.
          </p>
          <form
            className="mx-auto mt-4 flex max-w-md items-center gap-2"
            action="/dashboard"
            method="get"
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
        </div>
      </section>
    </main>
  );
}
