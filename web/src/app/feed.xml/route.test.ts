import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/blog/posts", () => ({
  getAllPosts: async () => [
    {
      slug: "hello",
      title: "Titre & <test>",
      description: "Desc",
      date: "2026-06-01",
      tags: ["x"],
      tool: "email-candidature-spontanee",
      faq: [],
      body: "",
      readingMinutes: 1,
    },
  ],
}));

import { GET } from "./route";

describe("feed.xml", () => {
  it("returns RSS XML with an escaped item", async () => {
    const res = await GET();
    expect(res.headers.get("content-type")).toContain("application/rss+xml");
    const xml = await res.text();
    expect(xml).toContain("<rss");
    expect(xml).toContain("https://www.cheatjob.com/fr/blog/hello");
    expect(xml).toContain("Titre &amp; &lt;test&gt;"); // escaped, not raw
  });
});
