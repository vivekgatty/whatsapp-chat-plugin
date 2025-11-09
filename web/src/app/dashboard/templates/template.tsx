import React from "react";
import LocaleEnhancer from "./LocaleEnhancer";

/**
 * Route-only wrapper for /dashboard/templates
 * - No UI/markup changes to your page.
 * - Simply renders the LocaleEnhancer alongside the existing page content.
 */
export default function TemplatesTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LocaleEnhancer />
    </>
  );
}
