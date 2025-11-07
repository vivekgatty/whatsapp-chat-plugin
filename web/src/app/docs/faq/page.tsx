"use client";
import { Section } from "@/components/docs";

export default function FAQ() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">FAQ</h1>

      <Section title="Do I need coding knowledge?">
        <p>No. You paste two small tags (copy buttons provided) and you’re done.</p>
      </Section>

      <Section title="Will it slow down my site?">
        <p>Scripts are async and tiny. They don’t block page rendering.</p>
      </Section>

      <Section title="How do languages work?">
        <p>We pick a template based on the user’s locale, with safe fallbacks to English/default.</p>
      </Section>

      <Section title="How do business hours work?">
        <p>You set your open windows and timezone. During open hours we send a greeting; otherwise an off-hours message.</p>
      </Section>
    </div>
  );
}
