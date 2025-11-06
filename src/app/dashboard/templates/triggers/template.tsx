import type { ReactNode } from "react";
import TriggerAnalyticsButton from "./TriggerAnalyticsButton";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <TriggerAnalyticsButton />
      {children}
    </>
  );
}
