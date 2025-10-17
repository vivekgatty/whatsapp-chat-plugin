// src/app/dev/snippet/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Dev: Embed Snippet",
};

type Widget = {
  id: string;
  business_id: string;
  cta_text: string | null;
  position: "left" | "right" | null;
  created_at: string;
};

function baseFromHeaders(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function getBaseUrl(): Promise<string> {
  // Prefer explicit env in hosted environments; otherwise derive from request headers
  const env = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  return env && env.length > 0 ? env : baseFromHeaders();
}

async function getWidgets(base: string): Promise<Widget[]> {
  const res = await fetch(`${base}/api/dev/widgets`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.widgets ?? []) as Widget[];
}

export default async function Page() {
  const base = await getBaseUrl();
  const widgets = await getWidgets(base);

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
        Dev: Embed Snippet
      </h1>

      <p style={{ marginBottom: 24 }}>
        Copy this snippet into any website right before the closing{" "}
        <code>&lt;/body&gt;</code> tag.
      </p>

      {widgets.length === 0 ? (
        <p>No widgets found.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {widgets.map((w) => {
            const snippet = `<script src="${base}/api/widget.js?id=${w.id}" async></script>`;
            return (
              <section
                key={w.id}
                style={{
                  border: "1px solid #333",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Widget ID</div>
                    <div style={{ fontFamily: "monospace" }}>{w.id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Business</div>
                    <div style={{ fontFamily: "monospace" }}>
                      {w.business_id}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>CTA / Position</div>
                  <div>
                    {w.cta_text ?? "Chat on WhatsApp"} &middot;{" "}
                    {w.position ?? "right"}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Embed snippet
                  </div>
                  <textarea
                    readOnly
                    rows={2}
                    style={{
                      width: "100%",
                      fontFamily: "monospace",
                      fontSize: 13,
                      padding: 8,
                      background: "#0b0b0b",
                      color: "#eaeaea",
                      borderRadius: 6,
                      border: "1px solid #333",
                    }}
                    defaultValue={snippet}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        Tip: try it on <code>/test.html</code> by swapping the widget ID in the
        script URL.
      </p>
    </main>
  );
}
