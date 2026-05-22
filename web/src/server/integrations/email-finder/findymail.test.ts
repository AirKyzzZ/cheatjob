import { describe, it, expect, vi, afterEach } from "vitest";
import { FindymailAdapter } from "./findymail";
import { EmailFinderUnavailableError } from "./index";

const QUERY = { firstName: "Jean", lastName: "Dupont", domain: "qonto.com" };

function mockFetch(impl: typeof fetch) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

afterEach(() => vi.unstubAllGlobals());

describe("FindymailAdapter", () => {
  it("returns found result on a successful lookup", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ contact: { email: "jean@qonto.com" } }), { status: 200 }),
    );
    const adapter = new FindymailAdapter("key");
    const result = await adapter.findEmail(QUERY);
    expect(result.found).toBe(true);
    if (result.found) expect(result.email).toBe("jean@qonto.com");
  });

  it("returns not-found when Findymail has no contact", async () => {
    mockFetch(async () => new Response(JSON.stringify({ contact: null }), { status: 200 }));
    const adapter = new FindymailAdapter("key");
    const result = await adapter.findEmail(QUERY);
    expect(result.found).toBe(false);
  });

  it("retries once on 5xx then throws EmailFinderUnavailableError", async () => {
    const fetchMock = vi.fn(async () => new Response("err", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const adapter = new FindymailAdapter("key");
    await expect(adapter.findEmail(QUERY)).rejects.toBeInstanceOf(EmailFinderUnavailableError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
