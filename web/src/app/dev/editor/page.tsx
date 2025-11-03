// src/app/dev/editor/page.tsx
import { createClient } from "@supabase/supabase-js";
import { CopyBox } from "./ClientParts";

// prevent static prerender so build won't try to execute Supabase calls
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // create the Supabase client at *request* time (not module scope)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // Friendly message instead of throwing during build/misconfig
    return (
      <div style={{ padding: 24 }}>
        <h1>Dev: Widget Editor</h1>
        <p>
          Missing Supabase envs. Please set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE</code> (or <code>SUPABASE_SERVICE_ROLE_KEY</code>) in your
          environment.
        </p>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Grab the newest widget to edit
  const { data: widget } = await supabase
    .from("widgets")
    .select("id,business_id,theme_color,icon,cta_text,position,prefill_message,created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!widget) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Dev: Widget Editor</h1>
        <p>No widgets found.</p>
      </div>
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Data-attributes embed (id + overrides mirrored from widget)
  const snippet = `<script src="${origin}/api/widget.js" data-id="${widget.id}" data-position="${widget.position ?? "right"}" data-theme-color="${widget.theme_color ?? "#10b981"}" data-icon="${widget.icon ?? "whatsapp"}" data-cta-text="${(
    widget.cta_text ?? "Chat with us on WhatsApp"
  ).replace(/"/g, "&quot;")}" data-prefill-message="${(
    widget.prefill_message ?? "Hey! I’d like to know more."
  ).replace(/"/g, "&quot;")}" async></script>`;

  return (
    <div style={{ padding: 24 }}>
      <h1>Dev: Widget Editor</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 20,
        }}
      >
        <div>
          <div style={{ opacity: 0.7, marginBottom: 8 }}>Widget ID</div>
          <div>{widget.id}</div>

          <div style={{ marginTop: 16, opacity: 0.7 }}>Business ID</div>
          <div>{widget.business_id}</div>

          <div style={{ marginTop: 16, opacity: 0.7 }}>Theme color</div>
          <div
            style={{
              width: 64,
              height: 32,
              background: widget.theme_color ?? "#10b981",
              borderRadius: 6,
              border: "1px solid #333",
            }}
            title={widget.theme_color ?? undefined}
          />

          <div style={{ marginTop: 16, opacity: 0.7 }}>Icon</div>
          <div>{widget.icon ?? "whatsapp"}</div>

          <div style={{ marginTop: 16, opacity: 0.7 }}>CTA text</div>
          <div>{widget.cta_text ?? "Chat with us on WhatsApp"}</div>

          <div style={{ marginTop: 16, opacity: 0.7 }}>Position</div>
          <div>{widget.position ?? "right"}</div>

          <div style={{ marginTop: 16, opacity: 0.7 }}>Prefill message</div>
          <div>{widget.prefill_message ?? "Hey! I’d like to know more."}</div>
        </div>

        <div>
          <div style={{ opacity: 0.7, marginBottom: 8 }}>Embed snippet</div>
          <textarea
            readOnly
            rows={6}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: 13,
              padding: 10,
              borderRadius: 8,
              background: "#0b0b0b",
              color: "#eaeaea",
              border: "1px solid #333",
            }}
            defaultValue={snippet}
          />
          <CopyBox snippet={snippet} />

          <div style={{ marginTop: 24 }}>
            <a href="/docs/install" style={{ color: "#10b981", textDecoration: "underline" }}>
              Read install docs →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
