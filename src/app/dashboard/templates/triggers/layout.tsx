import type { ReactNode } from "react";
import TriggerAnalyticsButton from "./TriggerAnalyticsButton";

// This layout wraps ONLY /dashboard/templates/triggers/*
// and injects the floating button without touching page.tsx
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <TriggerAnalyticsButton />
    </>
  );
}
