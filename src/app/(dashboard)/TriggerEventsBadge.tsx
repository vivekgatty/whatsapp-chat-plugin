"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TriggerEventsBadge() {
  const pathname = usePathname();
  if (pathname !== "/dashboard/analytics") return null;

  return (
    <Link
      href="/dashboard/analytics/triggers"
      aria-label="Trigger events"
      style={{
        position: "fixed",
        right: 16,
        top: 76,
        zIndex: 1000,
        padding: "8px 12px",
        borderRadius: 9999,
        background: "#f59e0b",
        color: "#111",
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: "0 6px 18px rgba(0,0,0,.25)",
      }}
    >
      Trigger events
    </Link>
  );
}