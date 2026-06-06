import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const run = vi.fn();
vi.mock("@/server/blog/pipeline", () => ({ runBlogPipeline: (...a: unknown[]) => run(...a) }));

import { GET } from "./route";

afterEach(() => {
  delete process.env.CRON_SECRET;
  run.mockReset();
});

function req(auth?: string): Request {
  return new Request("https://x/api/cron/blog-post", {
    headers: auth ? { authorization: auth } : {},
  });
}

describe("GET /api/cron/blog-post", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "s3cr3t";
    run.mockResolvedValue({ status: "skipped", reason: "queue exhausted" });
  });

  it("500 when the secret is unconfigured", async () => {
    delete process.env.CRON_SECRET;
    expect((await GET(req("Bearer s3cr3t"))).status).toBe(500);
  });

  it("401 on a wrong secret", async () => {
    expect((await GET(req("Bearer nope"))).status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });

  it("401 on a missing header", async () => {
    expect((await GET(req())).status).toBe(401);
  });

  it("runs the pipeline and returns its result on a valid secret", async () => {
    run.mockResolvedValue({ status: "published", slug: "x", attempts: 1, commitSha: "sha" });
    const res = await GET(req("Bearer s3cr3t"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "published", slug: "x" });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("returns 500 JSON when the pipeline throws", async () => {
    run.mockRejectedValue(new Error("infra error"));
    const res = await GET(req("Bearer s3cr3t"));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: "infra error" });
  });
});
