import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = [
    "Googlebot",
    "Google-Extended",
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Applebot-Extended",
    "CCBot",
  ].map((userAgent) => ({ userAgent, allow: "/" }));

  return {
    rules: [
      ...aiCrawlers,
      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/"] },
    ],
    sitemap: "https://www.cheatjob.com/sitemap.xml",
    host: "https://www.cheatjob.com",
  };
}
