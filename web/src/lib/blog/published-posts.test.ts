import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { validateBlogPost } from "@/server/blog/validators";

const DIR = path.join(process.cwd(), "content", "blog");
const files = (await fs.readdir(DIR).catch(() => [])).filter((f) => f.endsWith(".mdx"));

describe("published blog posts pass the validator", () => {
  if (files.length === 0) {
    it("no posts yet", () => expect(true).toBe(true));
  }
  it.each(files)("%s passes the gate", async (file) => {
    const raw = await fs.readFile(path.join(DIR, file), "utf8");
    const res = await validateBlogPost(raw);
    if (!res.ok) throw new Error(res.violations.join("; "));
    expect(res.ok).toBe(true);
  });
});
