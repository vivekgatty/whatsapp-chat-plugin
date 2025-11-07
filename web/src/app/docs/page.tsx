"use client";
import Link from "next/link";
import { Section } from "@/components/docs";

export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Welcome to Chatmadi Docs</h1>
      <Section title="What you will learn">
        <ul className="list-disc space-y-1 pl-5">
          <li>How the widget works and how to install it (copy–paste)</li>
          <li>Every dashboard button explained in plain English</li>
          <li>Multilingual templates &amp; off-hours logic (how we pick messages)</li>
          <li>Debugging steps and common fixes</li>
        </ul>
        <div className="flex gap-2 pt-2">
          <Link href="/docs/install" className="rounded bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500">Go to Install</Link>
          <Link href="/docs/dashboard" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Dashboard guide</Link>
        </div>
      </Section>
    </div>
  );
}
