"use client";

import { useEffect, useMemo, useState } from "react";

type Widget = {
  id: string;
  business_id: string;
  wa_number?: string | null;
  theme_color?: string | null;
  icon?: "whatsapp" | "message" | null;
  cta_text?: string | null;
  position?: "left" | "right" | null;
  prefill_message?: string | null;
  created_at?: string;
};

export default function SnippetGeneratorPage() {
  const [loading, setLoading] = useState(true);
  const [widget, setWidget] = useState<Widget | null>(null);
  const [mode, setMode] = useState<"query" | "data">("query");
  const origin =
    typeof window === "undefined" ? "" : (window.location.origin ?? "http://localhost:3000");

  // Load latest widget (same as we did elsewhere)
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/dev/widgets", { cache: "no-store" });
        const json = await res.json();
        const w: Widget | null = (json?.widgets ?? [])[0] ?? null;
        if (mounted) setWidget(w);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const snippetQuery = useMemo(() => {
    if (!widget) return "";
    return `<script src="${origin}/api/widget.js?id=${widget.id}" async></script>`;
  }, [widget, origin]);

  const snippetData = useMemo(() => {
    if (!widget) return "";
    const parts: string[] = [
      `<script`,
      `  src="${origin}/api/widget.js"`,
      `  data-id="${widget.id}"`,
    ];
    if (widget.position) parts.push(`  data-position="${widget.position}"`);
    if (widget.theme_color) parts.push(`  data-theme-color="${widget.theme_color}"`);
    if (widget.icon) parts.push(`  data-icon="${widget.icon}"`);
    if (widget.cta_text) parts.push(`  data-cta-text="${escapeAttr(widget.cta_text)}"`);
    if (widget.prefill_message)
      parts.push(`  data-prefill-message="${escapeAttr(widget.prefill_message)}"`);
    if (widget.wa_number) parts.push(`  data-wa-number="${widget.wa_number}"`);
    parts.push(`  async`);
    parts.push(`></script>`);
    return parts.join("\n");
  }, [widget, origin]);

  const snippet = mode === "query" ? snippetQuery : snippetData;

  async function copyCurrent() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    alert("Snippet copied to clipboard!");
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Dev: Script Generator</h1>
        <p>Loading widget…</p>
      </div>
    );
  }

  if (!widget) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Dev: Script Generator</h1>
        <p style={{ color: "#f87171" }}>No widgets found. Create one first on the editor page.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 980,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Dev: Script Generator</h1>

      <div
        style={{
          marginBottom: 12,
          fontSize: 13,
          opacity: 0.8,
        }}
      >
        Widget ID: <code>{widget.id}</code> · Business: <code>{widget.business_id}</code>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="radio"
            name="mode"
            value="query"
            checked={mode === "query"}
            onChange={() => setMode("query")}
          />
          Query param (<code>?id=</code>)
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="radio"
            name="mode"
            value="data"
            checked={mode === "data"}
            onChange={() => setMode("data")}
          />
          Data attributes (<code>data-*</code>)
        </label>

        <div style={{ flex: 1 }} />

        <a href="/docs/install" style={{ textDecoration: "underline", fontSize: 14 }}>
          Install docs
        </a>

        <a
          href={`/dev/preview?id=${encodeURIComponent(widget.id)}`}
          style={{ textDecoration: "underline", fontSize: 14 }}
        >
          Open preview
        </a>

        <button
          onClick={copyCurrent}
          style={{
            background: "#10b981",
            color: "black",
            border: "1px solid #065f46",
            padding: "8px 12px",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Copy
        </button>
      </div>

      <textarea
        readOnly
        rows={mode === "query" ? 3 : 10}
        value={snippet}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: 13,
          padding: 12,
          background: "#0b0b0b",
          color: "#eaeaea",
          borderRadius: 8,
          border: "1px solid #333",
        }}
      />

      <p style={{ marginTop: 12, opacity: 0.75, fontSize: 13 }}>
        Paste the snippet right before the closing <code>&lt;/body&gt;</code> on your site. Switch
        to <strong>data-attributes</strong> to override options from HTML without editing database
        settings.
      </p>

      <div style={{ marginTop: 16 }}>
        <a href="/dev" style={{ textDecoration: "underline" }}>
          ← Back to Dev
        </a>
      </div>
    </div>
  );
}

function escapeAttr(s: string) {
  return s.replace(/"/g, "&quot;");
}
