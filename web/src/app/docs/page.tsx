import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = (): Metadata =>
  pageMetadata({
    title: "Docs",
    path: "/docs",
    description:
      "ChatMadi documentation: installation, dashboard, multilingual templates, business hours, analytics, troubleshooting, and FAQs. Clear, step-by-step guides for non-technical users and developers.",
    image: "/og/chatmadi-og.png",
  });

export default function DocsHome() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-semibold">ChatMadi Documentation</h1>
      <p className="mb-6 text-slate-300">
        Start here to install the WhatsApp chat bubble, configure your widget, add multilingual templates,
        set business hours, verify analytics, and resolve common issues.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/docs/install"
          className="rounded border border-slate-700 bg-slate-900 p-4 hover:bg-slate-800"
        >
          <h2 className="text-lg font-medium">Install guide →</h2>
          <p className="text-sm text-slate-300">Copy the embed snippet and auto-trigger script for your site.</p>
        </Link>

        <Link
          href="/docs/dashboard"
          className="rounded border border-slate-700 bg-slate-900 p-4 hover:bg-slate-800"
        >
          <h2 className="text-lg font-medium">Dashboard (button-by-button) →</h2>
          <p className="text-sm text-slate-300">Every control explained with examples and QA tips.</p>
        </Link>

        <Link
          href="/docs/troubleshooting"
          className="rounded border border-slate-700 bg-slate-900 p-4 hover:bg-slate-800"
        >
          <h2 className="text-lg font-medium">Troubleshooting →</h2>
          <p className="text-sm text-slate-300">Fix common issues: no bubble, CSP, cache, hours, locales.</p>
        </Link>

        <Link
          href="/docs/faq"
          className="rounded border border-slate-700 bg-slate-900 p-4 hover:bg-slate-800"
        >
          <h2 className="text-lg font-medium">FAQ →</h2>
          <p className="text-sm text-slate-300">Answers to everything—install, pricing, analytics, and more.</p>
        </Link>
      </div>
    </div>
  );
}
