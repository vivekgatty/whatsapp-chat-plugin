import CopySnippet from "../../../components/docs/CopySnippet";

const EMBED = `<script src="https://chatmadi.com/api/widget.js?id=<WIDGET_ID>" async></script>`;
const AUTO  = `<script src="https://chatmadi.com/api/auto-trigger?wid=<WIDGET_ID>" async></script>`;

export default function Page() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Install guide</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">What to paste</h2>
        <p className="text-slate-300">Add the main widget tag (required), and optionally the auto-trigger loader.</p>
        <CopySnippet label="Embed widget" code={EMBED} />
        <CopySnippet label="Auto-trigger (optional)" code={AUTO} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Plain HTML site</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-200">
          <li>Open your site&apos;s HTML (usually <code>index.html</code>).</li>
          <li>Paste the embed snippet before the closing <code>&lt;/body&gt;</code>.</li>
          <li>Optionally paste the auto-trigger tag right below it.</li>
          <li>Reload your site — you should see the bubble in the corner.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">WordPress (Block Editor)</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-200">
          <li>Pages &rarr; Edit your page.</li>
          <li>Add a <strong>Custom HTML</strong> block near the end of the page.</li>
          <li>Paste the snippets; publish / update.</li>
          <li>Visit the page and verify the bubble renders.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Elementor (WordPress)</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-200">
          <li>Drag a <strong>HTML</strong> widget to the page footer area.</li>
          <li>Paste the snippets; update &amp; view page.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Webflow</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-200">
          <li>Project Settings &rarr; Custom Code.</li>
          <li>Paste the snippets inside the <strong>Before &lt;/body&gt; tag</strong> box; publish.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Wix / Squarespace</h2>
        <p className="text-slate-300">Use the custom code / embed HTML feature and paste the snippets near the end of the page or in global footer.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Shopify</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-200">
          <li>Online Store &rarr; Themes &rarr; Edit code.</li>
          <li>Open <code>theme.liquid</code> and paste the snippets before <code>{"</body>"}</code>.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">React / Next.js</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-200">
          <li>Add the snippets in <code>_document</code> (Next.js) or in your app&apos;s footer component using <code>dangerouslySetInnerHTML</code>.</li>
          <li>Or inject them via a layout wrapper that renders in <code>&lt;body&gt;</code>.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Vue / Angular / Vite</h2>
        <p className="text-slate-300">Paste in the global HTML template (e.g., <code>index.html</code> in Vite, <code>public/index.html</code> in CRA), just before <code>&lt;/body&gt;</code>.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Google Tag Manager</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-200">
          <li>Create a new <strong>Custom HTML</strong> tag with the embed snippet.</li>
          <li>Trigger on <strong>All Pages</strong>; publish container.</li>
          <li>Optionally add a second tag for the auto-trigger loader.</li>
        </ol>
      </section>

      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h2 className="mb-2 text-lg font-medium">Verify it works</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-200">
          <li>Open your site and confirm the chat bubble shows at the chosen corner.</li>
          <li>Use the <strong>Templates QA</strong> page to check multilingual / off-hours messages.</li>
          <li>Open your site’s console to confirm no CSP / network errors.</li>
        </ul>
      </div>
    </div>
  );
}

