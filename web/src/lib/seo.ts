import type { Metadata } from "next";

/**
 * Central SEO helper for pages.
 * Usage pattern in a page file:
 *   import { pageMetadata } from "@/lib/seo";
 *   export const generateMetadata = () =>
 *     pageMetadata({ title: "Docs", path: "/docs", description: "..." });
 */

export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://chatmadi.com";

const DEFAULTS = {
  title: "ChatMadi — WhatsApp Chat Plugin for Websites",
  description:
    "Add a fast, lightweight WhatsApp chat bubble to your website. Copy-paste install, multilingual templates, off-hours auto-replies, analytics, and more.",
  image: "/og/chatmadi-og.png",
  siteName: "ChatMadi",
  twitterHandle: "@chatmadi", // update if you want; empty is OK
};

type PageSEOInput = {
  title?: string;
  description?: string;
  path?: string;          // e.g. "/docs/faq"
  image?: string;         // absolute or relative
  noindex?: boolean;      // true to noindex a page
};

function absUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/**
 * Build Metadata with solid defaults + OG/Twitter cards.
 * Backwards compatible with previous usage across docs pages.
 */
export function pageMetadata(input: PageSEOInput = {}): Metadata {
  const title = input.title || DEFAULTS.title;
  const description = input.description || DEFAULTS.description;
  const url = absUrl(input.path || "/");
  const imageAbs = absUrl(input.image || DEFAULTS.image);

  // OpenGraph defaults
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type: "website",
    url,
    siteName: DEFAULTS.siteName,
    title,
    description,
    images: imageAbs ? [{ url: imageAbs }] : undefined,
  };

  // Twitter Card defaults
  const twitter: NonNullable<Metadata["twitter"]> = {
    card: "summary_large_image",
    title,
    description,
    images: imageAbs ? [imageAbs] : undefined,
    site: DEFAULTS.twitterHandle || undefined,
    creator: DEFAULTS.twitterHandle || undefined,
  };

  const robots: NonNullable<Metadata["robots"]> | undefined = input.noindex
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true };

  const alternates: NonNullable<Metadata["alternates"]> = {
    canonical: url,
  };

  return {
    title,
    description,
    openGraph,
    twitter,
    robots,
    alternates,
    // extra helpful defaults
    metadataBase: new URL(SITE),
    keywords: [
      "WhatsApp chat plugin",
      "WhatsApp widget",
      "website WhatsApp button",
      "chat bubble",
      "customer support",
      "lead generation",
      "multilingual auto reply",
      "business hours auto reply",
    ],
    other: {
      // Helpful for social scrapers that miss OG
      "og:locale": "en_IN",
    },
  };
}
