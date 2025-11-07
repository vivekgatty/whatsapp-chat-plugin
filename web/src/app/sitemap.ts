import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chatmadi.com";

/**
 * Sitemap:
 * - Include marketing/docs routes only
 * - Exclude dashboard/api (already disallowed in robots)
 * - Reasonable defaults for frequency/priority
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    { path: "",                  priority: 1.0,  changeFrequency: "weekly" },
    { path: "/docs",             priority: 0.9,  changeFrequency: "weekly" },
    { path: "/docs/dashboard",   priority: 0.8,  changeFrequency: "weekly" },
    { path: "/docs/install",     priority: 0.8,  changeFrequency: "weekly" },
    { path: "/docs/troubleshooting", priority: 0.8, changeFrequency: "weekly" },
    { path: "/docs/faq",         priority: 0.8,  changeFrequency: "weekly" },
  ] as const;

  return routes.map(r => ({
    url: `${SITE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
