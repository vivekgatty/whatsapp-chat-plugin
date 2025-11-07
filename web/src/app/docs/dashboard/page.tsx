"use client";

import Link from "next/link";

export default function DashboardDocs() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-10">
      <h1 className="text-2xl font-semibold">Dashboard guide (button-by-button)</h1>

      {/* Overview */}
      <section className="rounded border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="text-xl font-medium">Overview</h2>

        <h3 className="mt-3 font-semibold">Quick links to all sections</h3>
        <p className="text-slate-200">
          The Overview page acts like a control board with shortcuts to everything you’ll need while setting up or
          maintaining your WhatsApp chat widget. Think of it as a table of contents that’s always two clicks away. Each
          button at the top—{" "}
          <Link className="underline" href="/dashboard"<Link href="/docs" className="mr-2 inline-block rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800">Docs</Link> >Overview</Link>,{" "}
          <Link className="underline" href="/dashboard/widgets">Widget settings</Link>,{" "}
          <Link className="underline" href="/dashboard/templates">Templates</Link>,{" "}
          <Link className="underline" href="/dashboard/analytics">Analytics</Link>,{" "}
          <Link className="underline" href="/dashboard/billing">Billing</Link>{" "}
          — jumps directly into the tool you’re likely to use next. If you’re new, start with{" "}
          <Link className="underline" href="/docs/install">Install</Link> to copy your embed code,
          then come back to Overview to open <Link className="underline" href="/dashboard/templates">Templates</Link> and add messages in your language.
          When something looks off, use the quick link to{" "}
          <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>. These internal links keep you moving forward without hunting through menus, and they’re also helpful for SEO because they make the site easy to crawl and easy for humans to understand.
        </p>

        <h3 className="mt-3 font-semibold">Use it as a home base after sign-in</h3>
        <p className="text-slate-200">
          After you sign in, the Overview page is the best place to start each session. It shows where you left off and
          points you to the next most important step. For example, if you haven’t added templates yet, go to{" "}
          <Link className="underline" href="/dashboard/templates">Templates</Link> to create greeting and off-hours
          messages (we support English, Hindi, Kannada, and Tamil by default). If you haven’t turned on business hours,
          you can jump to <Link className="underline" href="/dashboard/language">Languages</Link> or{" "}
          <Link className="underline" href="/dashboard/hours">Business hours</Link> to make sure the right message
          shows at the right time. When you’re done, come back to Overview to open{" "}
          <Link className="underline" href="/dashboard/analytics">Analytics</Link> and verify impressions, opens,
          and clicks. Treat it like your project’s “home” tab—open, check, and continue.
        </p>
      </section>

      {/* Widget settings */}
      <section className="rounded border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="text-xl font-medium">Widget settings</h2>

        <h3 className="mt-3 font-semibold">Widget ID</h3>
        <p className="text-slate-200">
          Your Widget ID is a unique identifier that connects the bubble on your website to your settings in the
          dashboard. It looks like a long set of numbers and letters (for example, <code>bcd5…d1881</code>). Paste this
          ID into any snippet that shows <code>&lt;WIDGET_ID&gt;</code>. Keep it private—anyone with the ID could try to
          copy your configuration. If you manage more than one site, each site should have its own Widget ID so you can
          see clean analytics per site and safely customize colors, position, and templates. You can always confirm the
          right ID by visiting <Link className="underline" href="/dashboard/widgets">Widget settings</Link> or the{" "}
          <Link className="underline" href="/docs/install">Install</Link> page in the docs, where the ID is injected
          automatically into copy-buttons when you save it.
        </p>

        <h3 className="mt-3 font-semibold">Theme color</h3>
        <p className="text-slate-200">
          Theme color controls the look of your chat bubble and helps the widget blend into your brand. Pick a color
          that matches your website’s primary or accent color so the bubble feels native and trustworthy. If you’re not
          sure, choose a color with strong contrast against your background so the button remains visible without being
          distracting. You can change the color any time without touching your site’s code—simply update the value in{" "}
          <Link className="underline" href="/dashboard/widgets">Widget settings</Link> and refresh your page. The change
          applies instantly because the script loads the latest settings on every page view.
        </p>

        <h3 className="mt-3 font-semibold">Button position</h3>
        <p className="text-slate-200">
          Position decides where the bubble sits—bottom-left or bottom-right. The right side is common because it avoids
          overlapping typical navigation menus, but left works better on sites with sticky share bars or language
          pickers on the right. You can switch positions to see what feels natural with your layout. The widget is
          responsive and remains reachable on mobile (it rises above common UI such as cookie banners). If you’re using
          other floating widgets (e.g., “back to top” or help), place WhatsApp on the opposite side so nothing overlaps.
        </p>

        <h3 className="mt-3 font-semibold">Icon, CTA text, Prefill message</h3>
        <p className="text-slate-200">
          These three settings shape the first impression. The icon is the small graphic in the bubble, usually the
          WhatsApp glyph. The CTA text is the short line next to the icon (for example, “Chat with us”). Keep it
          inviting and clear. The Prefill message is what opens inside WhatsApp when someone clicks the bubble; we
          recommend a friendly starter such as “Hi, I’m interested in <em>[your product]</em>.” That saves your visitor
          from typing and gives your team context immediately. You can add emojis and variables later—keep it simple to
          start, then tune based on common questions you see in{" "}
          <Link className="underline" href="/dashboard/analytics">Analytics</Link>.
        </p>

        <h3 className="mt-3 font-semibold">Pre-chat requirements</h3>
        <p className="text-slate-200">
          If you want to collect a name, email, or a short note before WhatsApp opens, toggle pre-chat requirements. A
          tiny form appears above the bubble; when someone submits, we save a lead (visible under{" "}
          <Link className="underline" href="/dashboard/analytics">Analytics</Link> and in your leads export) and then
          open WhatsApp with the prefilled message. This light step removes spam, captures contact details for later
          follow-up, and gives your agent context. Keep the form short—every extra field reduces completion rates. If
          you later connect a webhook, we’ll post the lead to your CRM in real time.
        </p>

        <h3 className="mt-3 font-semibold">Copy buttons (Embed &amp; Auto-trigger) + live preview</h3>
        <p className="text-slate-200">
          Copy buttons provide the exact code your site needs. “Embed” adds the core widget script; “Auto-trigger”
          optionally opens the chat bubble by itself after a few seconds. The live preview on the right shows your color,
          position, and text before you copy anything, so you can click around and confirm sizing and behavior. When you
          press Copy, we automatically insert your saved Widget ID into the snippet. Paste it into your site just before
          the closing <code>&lt;/body&gt;</code> tag. For platform-specific steps see{" "}
          <Link className="underline" href="/docs/install">Install guide</Link>.
        </p>

        <h3 className="mt-3 font-semibold">Examples (placement, CSP notes)</h3>
        <p className="text-slate-200">
          Most sites paste the embed right before <code>&lt;/body&gt;</code>. If you use strict Content-Security-Policy
          (CSP) headers, you may need to allow our script’s domain and <code>connect-src</code> to our API. We keep the
          script small and cache-friendly so it doesn’t slow your page. If you use builders (WordPress, Webflow, Wix,
          Squarespace, Shopify), follow the platform notes in{" "}
          <Link className="underline" href="/docs/install">Install</Link>. If you run a SPA (React, Next.js, Vue,
          Angular), add the snippet to your global layout so it loads once per page view.
        </p>
      </section>

      {/* Templates */}
      <section className="rounded border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="text-xl font-medium">Templates</h2>

        <h3 className="mt-3 font-semibold">Filters, Refresh, Manage kinds, New</h3>
        <p className="text-slate-200">
          At the top of <Link className="underline" href="/dashboard/templates">Templates</Link> you’ll see filters for
          Widget ID, language (locale), and kind (for example, greeting or off_hours). Use these to narrow what you’re
          viewing, then press <em>Refresh</em> to reload. “Manage kinds” lets you add custom categories (like “promo” or
          “upsell”) so your site can pick specialized messages later. Click <em>New</em> to save a template with a clear
          internal name, language, kind, and the message body. You can write plain text or add emoji. Start with one
          greeting and one off-hours message per language, then build extra kinds as you learn what your audience needs.
        </p>

        <h3 className="mt-3 font-semibold">Creating multilingual templates</h3>
        <p className="text-slate-200">
          We support English (en), Hindi (hi), Kannada (kn), and Tamil (ta) out of the box, and you can add others. Create
          the same “kind” across languages so selection stays predictable. For example, make a “greeting” in en/hi/kn/ta
          with similar meaning and tone, then add an “off_hours” version in each. The
          <Link className="underline" href="/dashboard/templates/qa"> Templates QA</Link> page helps you test quickly:
          it calls the <code>/api/templates/choose</code> endpoint for several times and languages and shows pass/fail
          results. Use that to confirm fallbacks (e.g., if a language is missing, English is used).
        </p>

        <h3 className="mt-3 font-semibold">Templates QA (include inline business hours)</h3>
        <p className="text-slate-200">
          The QA page can inject business hours directly into the test URL so you can simulate “open” versus “closed”
          without saving hours first. Toggle the checkbox to include Mon–Sat 10:00–18:00 with Sunday closed, then run
          tests. A green PASS means the API picked the right kind (greeting vs off_hours) and returned a body. Click
          <em>open</em> on any row to see the raw API response. This tool is perfect for non-developers: you get instant
          confidence that customers will see a friendly greeting during the day and a polite “we’re offline” message at
          night.
        </p>
      </section>

      {/* Languages & Hours */}
      <section className="rounded border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="text-xl font-medium">Languages &amp; Business hours</h2>

        <h3 className="mt-3 font-semibold">How the language is chosen</h3>
        <p className="text-slate-200">
          The widget asks the API for the best template by passing your selected language and your widget ID. If a
          matching template exists, we use it. If not, we gracefully fall back to English or to a safe default so your
          visitor never sees a blank state. You can override language by passing <code>?locale=xx</code> to the API for
          testing, or by saving a preferred language in your site code later. The practical advice: create the same
          greeting and off_hours messages in the languages you serve most so users feel at home immediately.
        </p>

        <h3 className="mt-3 font-semibold">Set open windows, closed days, and timezone</h3>
        <p className="text-slate-200">
          Business hours decide whether we return a greeting or an off-hours message. In{" "}
          <Link className="underline" href="/dashboard/hours">Business hours</Link>, set your timezone and add windows
          for each day (for example, Mon–Sat 10:00–18:00, Sun closed). We treat gaps as “closed.” If your schedule
          changes seasonally, you can update hours at any time and the API will reflect it immediately. During testing
          you can also attach hours inline to the QA URL to simulate various times of day without saving changes.
        </p>
      </section>

      {/* Analytics */}
      <section className="rounded border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="text-xl font-medium">Analytics</h2>

        <h3 className="mt-3 font-semibold">What we log</h3>
        <p className="text-slate-200">
          We record impressions (bubble rendered), opens (chat opened), closes (chat closed), and clicks (WhatsApp
          opened). These events help you understand visibility, interest, and action. You’ll see totals, daily trends,
          and—where available—page breakdowns so you know which pages generate the most conversations. If you enable
          pre-chat, a submitted form creates a lead entry you can export. This is privacy-respectful analytics focused on
          the widget only; we do not fingerprint users, and we keep payloads minimal.
        </p>

        <h3 className="mt-3 font-semibold">CTR and breakdowns</h3>
        <p className="text-slate-200">
          Click-through rate (CTR) is clicks divided by impressions. A healthy CTR means your bubble is visible, your
          CTA is compelling, and your pages are attracting the right traffic. Use page breakdowns to spot placement
          opportunities—for example, if product pages show higher CTR than the homepage, consider moving the bubble
          higher on the homepage or adjusting the CTA text. If numbers look low, confirm that the embed is present on
          all critical pages and that other floating elements aren’t covering the bubble on mobile.
        </p>

        <h3 className="mt-3 font-semibold">Smoke test endpoints</h3>
        <p className="text-slate-200">
          For quick debugging, open{" "}
          <Link className="underline" href="/docs/troubleshooting">Troubleshooting</Link>. You’ll find ready-made URLs
          that call <code>/api/analytics</code> and <code>/api/track-lead</code> so you can verify events are writing to
          your database. We also include an example link for <code>/api/templates/choose</code> so you can confirm
          multilingual selection and off-hours logic. If any result is unexpected, copy the URL and share it with your
          developer or support—we can reproduce exactly what you saw and advise next steps.
        </p>
      </section>

      {/* Leads, Billing, Profile */}
      <section className="rounded border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="text-xl font-medium">Leads, Billing, and Profile</h2>

        <h3 className="mt-3 font-semibold">Leads</h3>
        <p className="text-slate-200">
          When pre-chat is on, every submitted form becomes a lead with timestamp and basic details. You can review
          totals inside <Link className="underline" href="/dashboard/analytics">Analytics</Link> and export if you want
          to follow up in a CRM. You can also configure a webhook (if your plan supports it) to send leads to your
          systems in real time. Keep your fields short—name, email, and a one-line question are usually enough to start a
          helpful conversation in WhatsApp.
        </p>

        <h3 className="mt-3 font-semibold">Billing</h3>
        <p className="text-slate-200">
          The Billing page lists your current plan and lets you upgrade or downgrade. If you’re on the Free plan, you
          can run a live widget with basic analytics and templates; paid tiers unlock advanced options such as lead
          webhooks and more granular analytics. All changes take effect immediately. You’ll also find receipts and an
          easy way to update card details so you don’t lose service.
        </p>

        <h3 className="mt-3 font-semibold">Profile</h3>
        <p className="text-slate-200">
          Add your business name and WhatsApp number exactly as users should message you. We validate the number format
          to avoid mis-dialed chats. You can also add a support email here; it appears in footer links and on
          troubleshooting screens. Keeping these details accurate helps the experience feel polished and professional.
        </p>
      </section>

      {/* Widget behavior & APIs */}
      <section className="rounded border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="text-xl font-medium">Widget behavior &amp; APIs</h2>

        <h3 className="mt-3 font-semibold">How the bubble renders</h3>
        <p className="text-slate-200">
          The script loads asynchronously, so it won’t block your page from rendering. We mount the bubble at the edge
          of the screen and keep its z-index above most elements so it stays tappable. On mobile, the bubble size and
          spacing adapt to thumbs; keyboard users can tab to the bubble and activate it with Enter. If your site has
          other overlays, use the position setting to avoid collisions.
        </p>

        <h3 className="mt-3 font-semibold">Auto-trigger rules</h3>
        <p className="text-slate-200">
          Auto-trigger can open the chat after a short delay to invite conversation. Use it gently: one gentle nudge is
          friendly; repeated pop-ups feel noisy. Start with a delay of 5–8 seconds on key pages and measure CTR in{" "}
          <Link className="underline" href="/dashboard/analytics">Analytics</Link>. If CTR drops, reduce frequency or
          turn it off on pages where users need quiet time to read.
        </p>

        <h3 className="mt-3 font-semibold">APIs for developers</h3>
        <p className="text-slate-200">
          <code>/api/widget.js</code> loads the bubble and emits events like <code>widget_view</code>,
          <code> widget_open</code>, and <code>click</code>. <code>/api/auto-trigger</code> is an optional
          helper for time-based opens. <code>/api/analytics</code> and <code>/api/track-lead</code> accept simple JSON
          payloads so you can log custom events or send leads from your own forms.{" "}
          <code>/api/templates/choose</code> picks a message based on language and business hours—with sensible
          fallbacks—so you can reuse the logic anywhere. See examples throughout these docs.
        </p>
      </section>

      <div className="flex gap-3">
        <Link className="rounded bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500" href="/docs/install">
          Go to Install
        </Link>
        <Link className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700" href="/docs/troubleshooting">
          Troubleshooting
        </Link>
      </div>
    </div>
  );
}

