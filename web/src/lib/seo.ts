import type { Metadata } from "next";

export const SITE_NAME = "ChatMadi";
export const SITE_URL  = "https://chatmadi.com";

export function makeTitle(part?: string): string {
  if (!part) return `${SITE_NAME} — WhatsApp Chat Plugin for Websites`;
  return `${part} · ${SITE_NAME}`;
}

export function canonicalUrl(path: string = "/"): string {
  try {
    // Normalize: ensure leading slash, strip trailing slash (except root)
    const clean = ("/" + (path || "/")).replace(/\/+/, "/").replace(/\/$/, "") || "/";
    return new URL(clean, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
}

export function pageMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;             // e.g. "/docs/faq"
  image?: string;            // absolute or path (we'll resolve)
  noindex?: boolean;
  locale?: string;           // e.g. "en"
  alternates?: Record<string, string>; // map of locale->path
} = {}): Metadata {
  const {
    title,
    description = "Add a WhatsApp chat bubble to your website in minutes. Copy a single script, customize the button, set business hours, multilingual auto-replies, track analytics, and capture leads.",
    path = "/",
    image,
    noindex = false,
    locale = "en",
    alternates = {},
  } = opts;

  const url = canonicalUrl(path);
  const img = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`)
    : `${SITE_URL}/og/chatmadi-og.png`;

  // Build locale alternates (hreflang)
  const alt: NonNullable<Metadata["alternates"]> = {
    canonical: url,
    languages: Object.fromEntries(
      Object.entries(alternates).map(([loc, p]) => [loc, canonicalUrl(p)])
    ),
  };

  const robots: Metadata["robots"] = noindex
    ? { index: false, follow: false, nocache: true, noimageindex: true }
    : { index: true, follow: true };

  return {
    title: makeTitle(title),
    description,
    metadataBase: new URL(SITE_URL),
    robots,
    alternates: alt,
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: makeTitle(title),
      description,
      images: [{ url: img }],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: makeTitle(title),
      description,
      images: [img],
    },
  };
}
