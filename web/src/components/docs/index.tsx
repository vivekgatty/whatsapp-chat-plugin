"use client";
import { useState } from "react";

export function Section(props: { title: string; children: any }) {
  return (
    <section className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">{props.title}</h2>
      <div className="space-y-3 text-slate-200">{props.children}</div>
    </section>
  );
}

export function CodeBlock({ code, inline=false }: { code: string; inline?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 1500);} catch {}
  }
  if (inline) {
    return (
      <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[0.9em]">{code}</code>
    );
  }
  return (
    <div className="relative">
      <button onClick={copy} className="absolute right-2 top-2 rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-3 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
