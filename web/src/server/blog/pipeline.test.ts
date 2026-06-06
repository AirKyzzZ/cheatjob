import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const generate = vi.fn();
const validate = vi.fn();
const commit = vi.fn();
const deploy = vi.fn();

vi.mock("./generate", () => ({ generateBlogPost: (...a: unknown[]) => generate(...a) }));
vi.mock("./validators", () => ({ validateBlogPost: (...a: unknown[]) => validate(...a) }));
vi.mock("@/server/integrations/github/commit", () => ({ commitFile: (...a: unknown[]) => commit(...a) }));
vi.mock("@/server/integrations/vercel/deploy-hook", () => ({ triggerDeploy: (...a: unknown[]) => deploy(...a) }));
vi.mock("@/lib/blog/queue", () => ({
  BLOG_QUEUE: [
    { slug: "first", title: "First", tool: "relancer-un-recruteur", angle: "a" },
    { slug: "second", title: "Second", tool: "relancer-un-recruteur", angle: "a" },
  ],
}));

import { runBlogPipeline, pickNextTopic } from "./pipeline";

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "blogpipe-"));
  generate.mockReset();
  validate.mockReset();
  commit.mockReset().mockResolvedValue({ commitSha: "sha1" });
  deploy.mockReset().mockResolvedValue({ triggered: true });
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("runBlogPipeline", () => {
  it("publishes on first valid generation", async () => {
    generate.mockResolvedValue("raw");
    validate.mockResolvedValue({ ok: true, frontmatter: {}, body: "b" });
    const res = await runBlogPipeline("2026-06-05", { contentDir: dir });
    expect(res).toMatchObject({ status: "published", slug: "first", attempts: 1, commitSha: "sha1" });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(deploy).toHaveBeenCalledTimes(1);
  });

  it("retries then skips when validation never passes", async () => {
    generate.mockResolvedValue("raw");
    validate.mockResolvedValue({ ok: false, violations: ["charter: vous"] });
    const res = await runBlogPipeline("2026-06-05", { contentDir: dir });
    expect(res.status).toBe("skipped");
    expect(generate).toHaveBeenCalledTimes(3);
    expect(commit).not.toHaveBeenCalled();
  });

  it("skips the already-published topic and picks the next", async () => {
    await fs.writeFile(path.join(dir, "first.mdx"), "x");
    expect((await pickNextTopic(dir))?.slug).toBe("second");
  });

  it("returns skipped when the queue is exhausted", async () => {
    await fs.writeFile(path.join(dir, "first.mdx"), "x");
    await fs.writeFile(path.join(dir, "second.mdx"), "x");
    const res = await runBlogPipeline("2026-06-05", { contentDir: dir });
    expect(res).toEqual({ status: "skipped", reason: "queue exhausted" });
  });

  it("dry-run writes the file locally and does not commit", async () => {
    generate.mockResolvedValue("raw-doc");
    validate.mockResolvedValue({ ok: true, frontmatter: {}, body: "b" });
    const res = await runBlogPipeline("2026-06-05", { contentDir: dir, dryRun: true });
    expect(res.status).toBe("published");
    expect(commit).not.toHaveBeenCalled();
    expect(await fs.readFile(path.join(dir, "first.mdx"), "utf8")).toContain("raw-doc");
  });

  it("treats a generation throw as a failed attempt and retries", async () => {
    generate.mockRejectedValueOnce(new Error("OpenRouter 503"));
    generate.mockResolvedValueOnce("raw");
    validate.mockResolvedValue({ ok: true, frontmatter: {}, body: "b" });
    const res = await runBlogPipeline("2026-06-05", { contentDir: dir });
    expect(res.status).toBe("published");
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
