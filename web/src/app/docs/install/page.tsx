"use client";
import { useWid } from "../../lib/wid";
import { Section, CodeBlock } from "@/components/docs";

export default function InstallPage() {
  const [wid, setWid] = useWid();
  const W = wid?.trim() || "<WIDGET_ID>";
  const widget = `<script src="https://chatmadi.com/api/widget.js?id=${W}" async></script>`;
  const trigger = `<script src="https://chatmadi.com/api/auto-trigger?wid=${W}" async></script>`;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Install guide</h1>

      <Section title="Step 0 — Tell the docs your Widget ID (so snippets fill automatically)">
        <div className="flex max-w-md gap-2">
          <input
            value={wid}
            onChange={(e)=>setWid(e.target.value)}
            placeholder="e.g. bcd51dd2-e61b-41d1-8848-9788eb8d1881"
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          />
          <button
            onClick={()=>setWid((document.querySelector('input') as HTMLInputElement)?.value || wid)}
            className="rounded bg-sky-600 px-3 py-2 text-sm hover:bg-sky-500"
          >
            Save
          </button>
        </div>
        <p className="text-sm text-slate-300">
          We store this only in your browser. All code blocks below will replace {"<WIDGET_ID>"} automatically.
        </p>
      </Section>

      <Section title="Step 1 — Copy these two snippets">
        <p>If you only remember one thing: paste the <strong>Widget</strong> tag and (optionally) the <strong>Auto-trigger</strong> tag.</p>
        <div>
          <div className="mb-2 text-sm font-semibold">Widget (required)</div>
          <CodeBlock code={widget} />
        </div>
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold">Auto-trigger (optional)</div>
          <CodeBlock code={trigger} />
          <p className="text-sm text-slate-300">This enables rule-based nudge + analytics. Place it <em>directly under</em> the Widget tag.</p>
        </div>
      </Section>

      <Section title="Step 2 — Where do I paste these? (choose your platform)">
        <h3 className="text-base font-semibold">Plain HTML site</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Open your site’s HTML file (often <code>index.html</code>).</li>
          <li>Scroll near the bottom and paste both tags just before the closing <code>{`</body>`}</code> tag.</li>
          <li>Save and publish/upload your file.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">WordPress (Block Editor)</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>From Dashboard → <b>Appearance</b> → <b>Editor</b> (Site Editor).</li>
          <li>Open <b>Theme</b> → <b>Footer</b> → add a <b>Custom HTML</b> block at the end.</li>
          <li>Paste both snippets, Update, then visit your site.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">Webflow</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Project Settings → <b>Custom Code</b>.</li>
          <li>In the “Footer Code” box, paste both snippets.</li>
          <li>Save Changes → Publish.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">Wix</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Settings → <b>Custom Code</b> → <b>+ Add Custom Code</b>.</li>
          <li>Paste both snippets, set location to “Body – end”, load on All pages.</li>
          <li>Apply → Publish.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">Squarespace</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Settings → <b>Advanced</b> → <b>Code Injection</b>.</li>
          <li>Paste both snippets into the <b>Footer</b> area → Save.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">Shopify</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Online Store → <b>Themes</b> → <b>Edit code</b>.</li>
          <li>Open <code>layout/theme.liquid</code>.</li>
          <li>Paste both snippets right before the closing <code>{`</body>`}</code> tag → Save.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">React / Next.js</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Open your root layout (e.g., <code>app/layout.tsx</code>).</li>
          <li>Add the two tags inside the returned HTML, just before <code>{`</body>`}</code>.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">Vue / Nuxt</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Nuxt: add to <code>app.vue</code> (inside template), near <code>{`</body>`}</code>.</li>
          <li>Vue CLI: add in <code>public/index.html</code> before <code>{`</body>`}</code>.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">Angular</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Open <code>src/index.html</code>.</li>
          <li>Paste both snippets before <code>{`</body>`}</code> → Save.</li>
        </ol>

        <h3 className="mt-4 text-base font-semibold">Google Tag Manager (GTM)</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Create a new <b>Custom HTML</b> tag.</li>
          <li>Paste both snippets. Trigger on All Pages.</li>
          <li>Submit changes → Publish.</li>
        </ol>
      </Section>

      <Section title="Step 3 — Confirm it works">
        <ul className="list-disc space-y-1 pl-5">
          <li>Visit your site → you should see a WhatsApp bubble (right-bottom by default).</li>
          <li>Click it → pre-chat (if enabled) appears, or it opens WhatsApp with your prefilled message.</li>
          <li>Open your <b>Dashboard → Analytics</b> to see impressions/clicks after a few visits.</li>
        </ul>
      </Section>

      <Section title="CSP note (if you use Content-Security-Policy)">
        <p>Add the following to your CSP to allow Chatmadi scripts:</p>
        <CodeBlock code={`script-src 'self' https://chatmadi.com; connect-src 'self' https://chatmadi.com;`} />
      </Section>
    </div>
  );
}
