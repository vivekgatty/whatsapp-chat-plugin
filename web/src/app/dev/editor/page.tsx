// src/app/dev/editor/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Widget = {
  id: string;
  business_id: string;
  theme_color: string | null;
  icon: "whatsapp" | "message" | null;
  cta_text: string | null;
  position: "left" | "right" | null;
  prefill_message: string | null;
  created_at: string;
};

export default function DevWidgetEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [widget, setWidget] = useState<Widget | null>(null);

  const [themeColor, setThemeColor] = useState("#10b981");
  const [icon, setIcon] = useState<"whatsapp" | "message">("whatsapp");
  const [ctaText, setCtaText] = useState("Chat with us on WhatsApp");
  const [position, setPosition] = useState<"left" | "right">("right");
  const [prefill, setPrefill] = useState("Hey! I'd like to know more.");

  // Load latest widget via existing dev endpoint
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dev/widgets", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Failed loading widgets");
        const w: Widget | undefined = json.widgets?.[0];
        if (!w) throw new Error("No widgets found. Create one first.");
        if (ignore) return;

        setWidget(w);
        setThemeColor(w.theme_color ?? "#10b981");
        setIcon((w.icon as any) ?? "whatsapp");
        setCtaText(w.cta_text ?? "Chat with us on WhatsApp");
        setPosition((w.position as any) ?? "right");
        setPrefill(w.prefill_message ?? "Hey! I'd like to know more.");
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? "Failed to load");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const previewUrl = useMemo(() => {
    if (!widget) return "#";
    // Our preview page already loads the script and shows the bubble
    return `/dev/preview?id=${encodeURIComponent(widget.id)}`;
  }, [widget]);

  async function save() {
    if (!widget) return;
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch(`/api/dev/widgets/${widget.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          theme_color: themeColor,
          icon,
          cta_text: ctaText,
          position,
          prefill_message: prefill,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Failed to save");
      setOk("Saved!");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Dev: Widget Editor</h1>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: "#f87171", marginBottom: 16 }}>Error: {error}</div>
      ) : !widget ? (
        <div>No widget found.</div>
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <Field label="Widget ID">
              <code>{widget.id}</code>
            </Field>
            <Field label="Business ID">
              <code>{widget.business_id}</code>
            </Field>

            <Field label="Theme color">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                style={{ width: 64, height: 36, background: "transparent", border: "1px solid #333" }}
              />
            </Field>

            <Field label="Icon">
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value as any)}
                style={selectStyle}
              >
                <option value="whatsapp">whatsapp</option>
                <option value="message">message</option>
              </select>
            </Field>

            <Field label="CTA text">
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Position">
              <div style={{ display: "flex", gap: 12 }}>
                <label><input type="radio" name="pos" value="left" checked={position === "left"} onChange={() => setPosition("left")} /> left</label>
                <label><input type="radio" name="pos" value="right" checked={position === "right"} onChange={() => setPosition("right")} /> right</label>
              </div>
            </Field>

            <Field label="Prefill message" full>
              <input
                type="text"
                value={prefill}
                onChange={(e) => setPrefill(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </section>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "10px 14px",
                background: "#10b981",
                borderRadius: 8,
                border: "1px solid #0e7d60",
                color: "white",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>

            <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>
              Open preview
            </a>

            {ok && <span style={{ color: "#34d399" }}>{ok}</span>}
            {error && <span style={{ color: "#f87171" }}>{error}</span>}
          </div>

          <section>
            <div style={{ opacity: 0.7, marginBottom: 8 }}>Embed snippet</div>
            <textarea
              readOnly
              rows={2}
              style={snippetStyle}
              value={`<script src="http://localhost:3000/api/widget.js?id=${widget.id}" async></script>`}
              onFocus={(e) => e.currentTarget.select()}
            />
          </section>

          <div style={{ marginTop: 24 }}>
            <a href="/dev" style={{ color: "#60a5fa" }}>← Back to Dev</a>
          </div>
        </>
      )}
    </main>
  );
}

function Field(props: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: props.full ? "1 / -1" : "auto" }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{props.label}</span>
      {props.children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "transparent",
  color: "inherit",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
} as React.CSSProperties;

const snippetStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "monospace",
  fontSize: 13,
  padding: 8,
  background: "#0b0b0b",
  color: "#eaeaea",
  borderRadius: 6,
  border: "1px solid #333",
};
