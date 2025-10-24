// src/app/docs/install/page.tsx
export default function InstallDocs() {
  return (
    <div
      style={{
        padding: 24,
        maxWidth: 860,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
        Install the WhatsApp Chat Plugin
      </h1>

      <p style={{ marginBottom: 12 }}>
        Paste your <code>&lt;script&gt;</code> tag right before the closing{" "}
        <code>&lt;/body&gt;</code> of your site.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>Embed snippet</h2>
      <p>
        Basic form using the widget <code>id</code>:
      </p>
      <pre
        style={{
          background: "#0b0b0b",
          color: "#eaeaea",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #333",
          overflowX: "auto",
        }}
      >
        {`<script src="https://YOUR-SITE.com/api/widget.js?id=YOUR_WIDGET_ID" async></script>`}
      </pre>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>
        Data-attributes (override config from HTML)
      </h2>
      <p>
        You can set or override options directly on the script tag using{" "}
        <strong>data-attributes</strong>:
      </p>
      <ul>
        <li>
          <code>data-id</code> – widget id (required if you don’t use <code>?id=</code>)
        </li>
        <li>
          <code>data-position</code> – <code>left</code> | <code>right</code>
        </li>
        <li>
          <code>data-theme-color</code> – hex like <code>#10b981</code>
        </li>
        <li>
          <code>data-icon</code> – <code>whatsapp</code> | <code>message</code>
        </li>
        <li>
          <code>data-cta-text</code> – accessible label/text
        </li>
        <li>
          <code>data-prefill-message</code> – WhatsApp prefilled message
        </li>
        <li>
          <code>data-wa-number</code> – optional override for WhatsApp number
        </li>
      </ul>

      <p style={{ marginTop: 8 }}>Example using data-attributes:</p>
      <pre
        style={{
          background: "#0b0b0b",
          color: "#eaeaea",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #333",
          overflowX: "auto",
        }}
      >
        {`<script
  src="https://YOUR-SITE.com/api/widget.js"
  data-id="YOUR_WIDGET_ID"
  data-position="right"
  data-theme-color="#10b981"
  data-icon="whatsapp"
  data-cta-text="Chat with us on WhatsApp"
  data-prefill-message="Hey! I'd like to know more."
  async
></script>`}
      </pre>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>Where to place the script</h2>
      <ol>
        <li>Open your site’s HTML layout/template.</li>
        <li>
          Scroll to the bottom and place the script tag <strong>just before</strong>{" "}
          <code>&lt;/body&gt;</code>.
        </li>
        <li>Deploy or refresh your page and look for the green WhatsApp bubble.</li>
      </ol>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>Verifying installation</h2>
      <ul>
        <li>Open the page and check the bottom-left/right for the bubble.</li>
        <li>
          Open DevTools → Network: you should see <code>GET /api/widget.js</code> and{" "}
          <code>POST /api/log</code> calls.
        </li>
        <li>Click the bubble; WhatsApp should open with your prefilled message.</li>
      </ul>

      <p style={{ marginTop: 16, opacity: 0.75, fontSize: 13 }}>
        Tip: Need a plain page to test quickly? Use <code>/sample-plain.html</code> from this app
        while developing.
      </p>
    </div>
  );
}
