export const runtime = "edge";

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

  // Keep this list in sync with your docs routes.
  const docsPages = [
    { path: "/docs",              changefreq: "weekly", priority: "0.90" },
    { path: "/docs/install",      changefreq: "weekly", priority: "0.85" },
    { path: "/docs/dashboard",    changefreq: "weekly", priority: "0.85" },
    { path: "/docs/troubleshooting", changefreq: "weekly", priority: "0.85" },
    { path: "/docs/faq",          changefreq: "weekly", priority: "0.85" },
  ];

  const urls = docsPages.map(p => {
    const loc = `${base}${p.path}`;
    return `
  <url>
    <loc>${xmlEscape(loc)}</loc>
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
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
