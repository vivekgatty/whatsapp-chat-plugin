import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chatmadi.com";

/**
 * Robots:
 * - Allow marketing/docs
 * - Disallow private/app-only routes
 * - Link sitemap + host
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/docs/*"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/_next",
          "/static",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
