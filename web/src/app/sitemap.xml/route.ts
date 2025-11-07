export const runtime = "edge"; // fast + cacheable

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = "https://chatmadi.com";
  const lastmod = new Date().toISOString();

  // Keep this sitemap focused on top-level public pages.
  // Detailed docs URLs will live in /sitemap-docs.xml (next commit).
  const pages = [
    { loc: `${base}/`,          changefreq: "weekly", priority: "1.0" },
    { loc: `${base}/docs`,      changefreq: "weekly", priority: "0.9" },
  ];

  const urls = pages.map(p => {
    return `
  <url>
    <loc>${xmlEscape(p.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      // Cache for 5 minutes at edge; browsers 5 minutes too.
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
