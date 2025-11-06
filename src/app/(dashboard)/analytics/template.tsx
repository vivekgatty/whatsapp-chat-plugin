export default function AnalyticsTemplate({ children }: { children: React.ReactNode }) {
  // Non-invasive: fixed link, no dependencies, no layout changes
  return (
    <>
      <a
        href="/dashboard/analytics/triggers"
        style={{
          position: "fixed",
          right: 16,
          top: 76,              // below your top nav; adjust if needed
          zIndex: 1000,
          padding: "8px 12px",
          borderRadius: 9999,
          background: "#f59e0b", // amber-ish
          color: "#111",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 6px 18px rgba(0,0,0,.25)",
        }}
        aria-label="Trigger events"
      >
        Trigger events
      </a>
      {children}
    </>
  );
}