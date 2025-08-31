import { posts } from "@/app/blog/posts";

export async function GET() {
  const baseUrl = "https://plumsprout.com";
  
  const staticPages = [
    {
      url: baseUrl,
      changeFreq: "weekly",
      priority: 1.0,
      lastModified: new Date().toISOString()
    },
    {
      url: `${baseUrl}/blog`,
      changeFreq: "daily",
      priority: 0.9,
      lastModified: new Date().toISOString()
    },
    {
      url: `${baseUrl}/about`,
      changeFreq: "monthly",
      priority: 0.7,
      lastModified: new Date().toISOString()
    },
    {
      url: `${baseUrl}/contact`,
      changeFreq: "monthly",
      priority: 0.6,
      lastModified: new Date().toISOString()
    }
  ];

  const blogPosts = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    changeFreq: "monthly",
    priority: 0.8,
    lastModified: post.updatedAt || post.date
  }));

  const allPages = [...staticPages, ...blogPosts];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}