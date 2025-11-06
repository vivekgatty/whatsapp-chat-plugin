"use client";

export default function TriggersButton() {
  return (
    <a
      href="/dashboard/templates/triggers"
      className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500 text-black border border-emerald-400 hover:bg-emerald-400"
    >
      Custom triggers
      <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/20 border border-black/30">Pro</span>
    </a>
  );
}