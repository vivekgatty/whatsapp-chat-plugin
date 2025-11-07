"use client";

import { useMemo, useState } from "react";
import { getWid } from "@/lib/wid";

type Props = {
  code: string;
  label?: string;
};

export default function CopySnippet({ code, label }: Props) {
  const [copied, setCopied] = useState(false);
  const wid = typeof window !== "undefined" ? getWid() : "";
  const rendered = useMemo(() => {
    const w = wid?.trim() || "<WIDGET_ID>";
    return code.replaceAll("<WIDGET_ID>", w);
  }, [code, wid]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(rendered);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="relative mb-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <div className="text-xs text-slate-300">{label ?? "Snippet"}</div>
        <button
          onClick={onCopy}
          className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto p-3 text-[13px] leading-5 text-slate-100">
        <code>{rendered}</code>
      </pre>
    </div>
  );
}

