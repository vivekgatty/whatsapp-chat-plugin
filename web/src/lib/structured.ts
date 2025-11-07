/**
 * Lightweight JSON-LD builders for ChatMadi.
 * Use these from any page and embed via:
 *
 *   import { websiteJsonLd, orgJsonLd, breadcrumbJsonLd, faqJsonLd, toJson } from "@/lib/structured";
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJson(websiteJsonLd({...})) }} />
 *
 * Keep this file framework-agnostic (no React imports) so it can be used from RSC or client components.
 */

export type JsonLd = Record<string, unknown>;
const CTX = "https://schema.org";

type OrgInput = {
  name: string;
  url: string;            // absolute
  logo?: string;          // absolute
  sameAs?: string[];      // social profiles
};

export function orgJsonLd(input: OrgInput): JsonLd {
  const { name, url, logo, sameAs } = input;
  const data: JsonLd = {
    "@context": CTX,
    "@type": "Organization",
    name,
    url,
  };
  if (logo) (data as any).logo = logo;
  if (sameAs?.length) (data as any).sameAs = sameAs;
  return data;
}

type WebsiteInput = {
  url: string;                  // absolute canonical site URL
  name?: string;                // site name
  searchActionUrlTemplate?: string; // e.g. "https://chatmadi.com/search?q={search_term_string}"
};

export function websiteJsonLd(input: WebsiteInput): JsonLd {
  const { url, name, searchActionUrlTemplate } = input;
  const data: JsonLd = {
    "@context": CTX,
    "@type": "WebSite",
    url,
  };
  if (name) (data as any).name = name;

  if (searchActionUrlTemplate) {
    (data as any).potentialAction = {
      "@type": "SearchAction",
      target: searchActionUrlTemplate,
      "query-input": "required name=search_term_string",
    };
  }
  return data;
}

type Crumb = { name: string; url?: string }; // last crumb can omit url

export function breadcrumbJsonLd(items: Crumb[]): JsonLd {
  return {
    "@context": CTX,
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.url ? { item: c.url } : {}),
    })),
  };
}

type FAQ = { question: string; answer: string };

export function faqJsonLd(faqs: FAQ[]): JsonLd {
  return {
    "@context": CTX,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/** Stringify with safe defaults for embedding into a <script type="application/ld+json"> tag. */
export function toJson(data: JsonLd): string {
  return JSON.stringify(data);
}
