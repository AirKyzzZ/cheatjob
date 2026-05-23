import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
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

describe("FindymailAdapter — E2E_MOCK", () => {
  beforeEach(() => {
    process.env.E2E_MOCK = "1";
  });
  afterEach(() => {
    delete process.env.E2E_MOCK;
  });

  it("returns canned found result without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const adapter = new FindymailAdapter("e2e-mock");
    const result = await adapter.findEmail(QUERY);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.email).toBe("jean.dupont@qonto.com");
      expect(result.confidence).toBe("high");
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns not-found for lastName containing 'notfound' without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const adapter = new FindymailAdapter("e2e-mock");
    const result = await adapter.findEmail({ firstName: "Test", lastName: "Notfound", domain: "x.com" });
    expect(result.found).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws EmailFinderUnavailableError for lastName containing 'unavailable' without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const adapter = new FindymailAdapter("e2e-mock");
    await expect(
      adapter.findEmail({ firstName: "Test", lastName: "Unavailable", domain: "x.com" }),
    ).rejects.toBeInstanceOf(EmailFinderUnavailableError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
