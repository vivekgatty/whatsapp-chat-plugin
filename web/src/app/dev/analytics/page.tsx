// src/app/dev/analytics/page.tsx
export const dynamic = "force-dynamic";

type DailyRow = {
  date: string;
  widget_view: number;
  chat_click: number;
};

type MetricsResponse = {
  ok: boolean;
  business_id: string;
  totals: { widget_view: number; chat_click: number };
  daily: DailyRow[];
};

// TODO: Replace with your real business_id later; using your current one for dev.
const BUSINESS_ID = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div
      style={{
        border: "1px solid #333",
        background: "#0b0b0b",
        padding: 16,
        borderRadius: 8,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.6 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

export default async function Page() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(
    `${base}/api/dev/metrics?business_id=${encodeURIComponent(BUSINESS_ID)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
        <h1>Dev: Analytics</h1>
        <p style={{ color: "#f87171" }}>
          Failed to load metrics (HTTP {res.status}). Check the server logs.
        </p>
      </div>
    );
  }

  const data = (await res.json()) as MetricsResponse;

  const views = data.totals?.widget_view ?? 0;
  const clicks = data.totals?.chat_click ?? 0;
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) + "%" : "0%";

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Dev: Analytics</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <Card title="Views" value={views} />
        <Card title="Clicks" value={clicks} />
        <Card title="CTR" value={ctr} />
      </div>

      <h2 style={{ marginTop: 24, fontSize: 18, fontWeight: 600 }}>Last 7 days</h2>

      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #333",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderBottom: "1px solid #333",
                  background: "#0b0b0b",
                }}
              >
                Date
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "8px 10px",
                  borderBottom: "1px solid #333",
                  background: "#0b0b0b",
                }}
              >
                Views
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "8px 10px",
                  borderBottom: "1px solid #333",
                  background: "#0b0b0b",
                }}
              >
                Clicks
              </th>
            </tr>
          </thead>
          <tbody>
            {data.daily?.map((d) => (
              <tr key={d.date}>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid #222" }}>{d.date}</td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "right",
                    borderBottom: "1px solid #222",
                  }}
                >
                  {d.widget_view}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "right",
                    borderBottom: "1px solid #222",
                  }}
                >
                  {d.chat_click}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, opacity: 0.7, fontSize: 13 }}>
        Using <code>/api/dev/metrics?business_id=…</code>. In production, the dashboard will use the
        signed-in user’s tenant to resolve <code>business_id</code> automatically.
      </div>

      <div style={{ marginTop: 16 }}>
        <a href="/dev" style={{ textDecoration: "none" }}>
          ← Back to Dev
        </a>
      </div>
    </div>
  );
}
