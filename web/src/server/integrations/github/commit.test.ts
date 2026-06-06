import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { commitFile, GitHubCommitError } from "./commit";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.E2E_MOCK;
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_REPO;
});

describe("commitFile", () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = "tok";
    process.env.GITHUB_REPO = "AirKyzzZ/cheatjob";
  });

  it("creates a new file when none exists (404 on GET)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ commit: { sha: "abc" } }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await commitFile({ path: "web/content/blog/x.mdx", content: "hi", message: "m" });
    expect(res.commitSha).toBe("abc");
    const putBody = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(putBody.content).toBe(Buffer.from("hi", "utf8").toString("base64"));
    expect(putBody.sha).toBeUndefined();
  });

  it("includes the existing blob sha when updating", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: "old" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ commit: { sha: "new" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await commitFile({ path: "web/content/blog/x.mdx", content: "hi", message: "m" });
    const putBody = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(putBody.sha).toBe("old");
  });

  it("throws on a failed PUT", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("nf", { status: 404 }))
        .mockResolvedValueOnce(new Response("boom", { status: 500 })),
    );
    await expect(commitFile({ path: "p", content: "c", message: "m" })).rejects.toBeInstanceOf(GitHubCommitError);
  });

  it("throws when GITHUB_TOKEN is missing", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(commitFile({ path: "p", content: "c", message: "m" })).rejects.toBeInstanceOf(GitHubCommitError);
  });

  it("short-circuits under E2E_MOCK without calling fetch", async () => {
    process.env.E2E_MOCK = "1";
    const spy = vi.spyOn(global, "fetch");
    const res = await commitFile({ path: "p", content: "c", message: "m" });
    expect(res.commitSha).toBe("e2e-mock-sha");
    expect(spy).not.toHaveBeenCalled();
  });
});
