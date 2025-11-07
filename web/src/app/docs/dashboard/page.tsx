"use client";
import Link from "next/link";
import { Section, CodeBlock } from "@/components/docs";
import { useWid } from "@/lib/wid";

export default function DashboardDocs() {
  const [wid] = useWid();
  const W = wid?.trim() || "<WIDGET_ID>";
  const widget = `<script src="https://chatmadi.com/api/widget.js?id=${W}" async></script>`;
  const trigger = `<script src="https://chatmadi.com/api/auto-trigger?wid=${W}" async></script>`;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard guide (button-by-button)</h1>

      <Section title="Overview">
        <ul className="list-disc space-y-1 pl-5">
          <li>Quick links to all sections.</li>
          <li>Use it as a home base after sign-in.</li>
        </ul>
      </Section>

      <Section title="Widget settings">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Widget ID</b>: the unique id used in your embed code. Keep it safe.</li>
          <li><b>Theme color</b>: the bubble color.</li>
          <li><b>Button position</b>: left or right bottom corner.</li>
          <li><b>Icon</b>, <b>CTA text</b>, <b>Prefill message</b>: what users see and what opens in WhatsApp.</li>
          <li><b>Pre-chat requirements</b>: collect name/message before opening WhatsApp.</li>
          <li><b>Copy buttons</b>: copy your <i>Widget</i> and <i>Auto-trigger</i> tags below.</li>
        </ul>
        <div className="mt-3">
          <div className="text-sm font-semibold">Your embed (example)</div>
          <CodeBlock code={widget} />
          <div className="mt-2 text-sm font-semibold">Auto-trigger (optional)</div>
          <CodeBlock code={trigger} />
        </div>
      </Section>

      <Section title="Templates">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Filters</b>: Widget ID (optional), Locale (en/hi/kn/ta), Kind (system + custom).</li>
          <li><b>Manage kinds</b>: add your own kinds (e.g., promo, upsell).</li>
          <li><b>New</b>: create a template with name, locale, kind, and body.</li>
          <li><b>Templates QA</b>: runs 8 checks. The “Include inline business hours” toggle simulates Mon–Sat 10:00–18:00, Sun closed. A PASS means the choose-API returned a valid body for the expected kind.</li>
        </ul>
      </Section>

      <Section title="Languages">
        <ul className="list-disc space-y-1 pl-5">
          <li>Locale is chosen by: explicit URL param → browser language → default en.</li>
          <li>Fallbacks: if a locale template isn’t found, we fall back to English or default copy.</li>
        </ul>
      </Section>

      <Section title="Business hours">
        <ul className="list-disc space-y-1 pl-5">
          <li>Set open windows per day + timezone.</li>
          <li>During open windows we pick <b>greeting</b>; otherwise we pick <b>off_hours</b>.</li>
        </ul>
      </Section>

      <Section title="Analytics">
        <ul className="list-disc space-y-1 pl-5">
          <li>We log: <b>impressions</b> (bubble visible), <b>opens</b>, <b>closes</b>, <b>clicks</b>.</li>
          <li>CTR = clicks ÷ impressions.</li>
          <li>Daily + per-page breakdowns help you spot which pages convert.</li>
          <li>Smoke test endpoints: see <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link>.</li>
        </ul>
      </Section>

      <Section title="Leads / Billing / Profile">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Leads</b>: view or export captured leads (and webhook if enabled).</li>
          <li><b>Billing</b>: see plan, upgrade/downgrade.</li>
          <li><b>Profile</b>: business name + WhatsApp number (E.164 formatting recommended).</li>
        </ul>
      </Section>

      <Section title="Widget behavior & customization">
        <ul className="list-disc space-y-1 pl-5">
          <li>Asynchronous load; non-blocking.</li>
          <li>Auto-trigger rules: gentle nudge after time/scroll (when enabled).</li>
          <li>Accessible: keyboard focusable; responsive bubble for mobile.</li>
        </ul>
      </Section>

      <Section title="APIs (for developers)">
        <ul className="list-disc space-y-1 pl-5">
          <li><code>/api/widget.js</code> — loads the bubble; emits open/close/click events.</li>
          <li><code>/api/auto-trigger</code> — add if you want time/scroll nudges + analytics.</li>
          <li><code>/api/analytics</code>, <code>/api/track-lead</code> — POST usage for event + lead logging.</li>
          <li><code>/api/templates/choose</code> — returns the chosen template given wid/locale/time.</li>
        </ul>
      </Section>
    </div>
  );
}

