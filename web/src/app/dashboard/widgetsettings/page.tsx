import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widget settings — ChatMadi",
  description: "Install snippet and basic settings for your ChatMadi widget.",
};

export default function Page() {
  // NOTE: replace this fallback with your DB-driven widget id once we wire it up.
  const defaultWid = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

  const snippet = `<script async src="https://chatmadi.com/api/widget.js?wid=${defaultWid}"></script>`;

  const snippetWithPrechat = `<script async src="https://chatmadi.com/api/widget.js?wid=${defaultWid}&prechat=on"></script>`;

  const snippetWithWhatsApp = `<script
  async
  src="https://chatmadi.com/api/widget.js?wid=${defaultWid}"
  data-wa-number="+91XXXXXXXXXX"></script>`;

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Widget settings</h1>

      <div className="space-y-10 text-sm leading-6">
        <section>
          <h2 className="text-lg font-medium mb-2">Install snippet</h2>
          <p className="opacity-80 mb-2">
            Paste this right before the closing <code>&lt;/body&gt;</code> tag on your website.
          </p>
          <pre className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 overflow-x-auto">
{snippet}
          </pre>
        </section>

        <section>
          <h3 className="text-base font-medium mb-2">Enable pre-chat panel (optional)</h3>
          <pre className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 overflow-x-auto">
{snippetWithPrechat}
          </pre>
          <p className="opacity-70 mt-2">
            Adds a small name/message form that can post leads even if WhatsApp isn’t opened.
          </p>
        </section>

        <section>
          <h3 className="text-base font-medium mb-2">WhatsApp number via data attribute (optional)</h3>
          <pre className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 overflow-x-auto">
{snippetWithWhatsApp}
          </pre>
          <p className="opacity-70 mt-2">
            You can also pass <code>waNumber</code> as a query param if preferred.
          </p>
        </section>

        <section>
          <h3 className="text-base font-medium mb-2">Notes</h3>
          <ul className="list-disc ml-5 space-y-1 opacity-80">
            <li>The snippet loads a lightweight script and tracks impressions, opens, closes, and clicks.</li>
            <li>Use the <em>Templates</em> page to edit greetings/off-hours replies and languages.</li>
            <li>Find your widget ID on the <em>Overview</em> page. This page uses a fallback ID for now.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
