export default function Page() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Troubleshooting</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Bubble not appearing</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-200">
          <li>Confirm the embed snippet is present on the page (view source).</li>
          <li>Ad-blockers or strict CSP can block third-party scripts — allow <code>chatmadi.com</code>.</li>
          <li>For SPAs/Next.js, ensure the snippet renders in the final HTML (not just during SSR).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Auto-trigger didn&apos;t fire</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-200">
          <li>Include the second tag <em>below</em> the widget embed.</li>
          <li>Verify your business hours and templates exist (and for the chosen locale).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Template selection looks wrong</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-200">
          <li>Use <code>/dashboard/templates/qa</code> to see decisions and direct links.</li>
          <li>Try the <code>/api/templates/choose</code> URL with <code>h</code>/<code>m</code> and inline hours to isolate issues.</li>
        </ul>
      </section>
    </div>
  );
}
