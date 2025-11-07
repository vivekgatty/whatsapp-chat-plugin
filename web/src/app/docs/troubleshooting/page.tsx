"use client";
import { Section, CodeBlock } from "@/components/docs";
import { useWid } from "@/lib/wid";

export default function Troubleshooting() {
  const [wid] = useWid();
  const W = wid?.trim() || "<WIDGET_ID>";
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Troubleshooting</h1>

      <Section title="Bubble doesn’t appear">
        <ul className="list-disc space-y-1 pl-5">
          <li>Confirm you pasted the widget tag before <code>{`</body>`}</code>.</li>
          <li>Check your ad-blocker or CSP (see CSP note in Install).</li>
          <li>Open Console (F12) → look for blocked script errors.</li>
        </ul>
      </Section>

      <Section title="Clicks don’t show in Analytics">
        <ul className="list-disc space-y-1 pl-5">
          <li>Make sure the <b>Auto-trigger</b> tag is also present (it enables analytics).</li>
          <li>Visit a page and click the bubble; refresh Analytics after a minute.</li>
        </ul>
      </Section>

      <Section title="Verify choose() responses quickly">
        <CodeBlock code={`GET https://chatmadi.com/api/templates/choose?wid=${W}&locale=en&h=11&m=15`} />
        <p className="text-sm text-slate-300">You should see a JSON with <code>ok:true</code> and a chosen template.</p>
      </Section>
    </div>
  );
}

