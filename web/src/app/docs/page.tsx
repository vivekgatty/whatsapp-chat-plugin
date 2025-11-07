import Link from "next/link";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome to Chatmadi Docs</h1>
      <p className="text-slate-300">
        These docs serve both newcomers and developers. Start with{" "}
        <Link href="/docs/install" className="underline">Install</Link>, then explore dashboard
        pages (Widget settings, Templates, Languages, Business hours, Analytics), and finish with
        troubleshooting tips.
      </p>

      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h2 className="mb-2 text-lg font-medium">What you&apos;ll learn</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-200">
          <li>How the widget works, what each dashboard button does</li>
          <li>How to install on HTML, WordPress, Webflow, Wix, Squarespace, Shopify, React, Vue, Angular, GTM</li>
          <li>How multilingual templates & off-hours logic select the right message</li>
          <li>APIs for developers and common debugging steps</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Link href="/docs/install" className="rounded bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500">
          Go to Install guide
        </Link>
        <Link href="/docs/troubleshooting" className="rounded bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700">
          Troubleshooting
        </Link>
      </div>
    </div>
  );
}
