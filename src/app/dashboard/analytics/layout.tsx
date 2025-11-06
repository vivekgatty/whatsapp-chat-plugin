import type { ReactNode } from "react";
import TriggerAnalyticsCTA from "./TriggerAnalyticsCTA";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <TriggerAnalyticsCTA />
    </>
  );
}
