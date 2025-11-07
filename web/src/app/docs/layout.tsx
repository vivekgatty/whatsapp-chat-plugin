import Link from "next/link";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: "/docs", label: "Welcome" },
    { href: "/docs/install", label: "Install" },
    { href: "/docs/dashboard", label: "Dashboard" },
    { href: "/docs/troubleshooting", label: "Troubleshooting" },
    { href: "/docs/faq", label: "FAQ" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px,1fr]">
        <aside className="rounded-lg border border-slate-700 bg-slate-900">
          <div className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-300">Docs</div>
          <nav className="px-2 pb-4">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-700 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">Use my Widget ID</div>
            {/* This form is read-only client-side in the child pages; kept here for layout consistency */}
            <form className="space-y-2 text-sm">
              <input
                readOnly
                placeholder="Set on each page"
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"
              />
              <p className="text-xs text-slate-400">Saved in your browser only; replaces {"<WIDGET_ID>"} in snippets.</p>
            </form>
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
