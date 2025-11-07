export const runtime = "edge";

export async function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /dashboard/",
    "Disallow: /api/",
    "Disallow: /_next/",
    "",
    "Sitemap: https://chatmadi.com/sitemap.xml",
    "Sitemap: https://chatmadi.com/sitemap-docs.xml",
    ""
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300"
    }
  });
}
