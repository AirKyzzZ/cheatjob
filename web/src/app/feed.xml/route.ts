import { getAllPosts } from "@/lib/blog/posts";

export const dynamic = "force-static";

const HOSTNAME = "https://www.cheatjob.com";

const ESCAPES: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ESCAPES[c]);
}

export async function GET() {
  const posts = await getAllPosts();
  const items = posts
    .map(
      (p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${HOSTNAME}/fr/blog/${p.slug}</link>
      <guid>${HOSTNAME}/fr/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Cheatjob — Blog</title>
  <link>${HOSTNAME}/fr/blog</link>
  <description>Conseils emploi, candidature et relance.</description>
  <language>fr</language>${items}
</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
