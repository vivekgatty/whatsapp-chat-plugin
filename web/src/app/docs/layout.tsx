"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWid, setWid } from "../../lib/wid";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [wid, setWidState] = useState("");

  useEffect(() => {
    setWidState(getWid());
  }, []);

  function onSave() {
    setWid(wid);
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block rounded px-2 py-1 text-sm hover:bg-slate-800">
      {children}
    </Link>
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-max rounded-lg border border-slate-700 bg-slate-900 p-3">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Docs
        </div>
        <nav className="mb-4 space-y-1">
          <NavLink href="/docs">Welcome</NavLink>
          <NavLink href="/docs/install">Install</NavLink>
          <NavLink href="/docs/troubleshooting">Troubleshooting</NavLink>
          <NavLink href="/docs/faq">FAQ</NavLink>
        </nav>

        <div className="rounded border border-slate-700 bg-slate-950 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Use my Widget ID
          </div>
          <input
            value={wid}
            onChange={(e) => setWidState(e.target.value)}
            placeholder="e.g. bcd5-…-d1881"
            className="mb-2 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
          />
          <button
            onClick={onSave}
            className="w-full rounded bg-sky-600 px-2 py-1 text-sm hover:bg-sky-500"
          >
            Save for snippets
          </button>
          <p className="mt-2 text-[11px] text-slate-400">
            Saved in your browser only; replaces &lt;WIDGET_ID&gt; when you copy.
          </p>
        </div>
      </aside>

      <main>{children}</main>
    </div>
  );
}
