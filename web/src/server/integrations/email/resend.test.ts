import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ResendAdapter, getEmailSender } from "./resend";
import { EmailSendError } from "./index";

afterEach(() => vi.unstubAllGlobals());

const INPUT = {
  to: "user@example.com",
  from: "notifications@cheatjob.com",
  subject: "Test",
  html: "<p>Hi</p>",
};

describe("ResendAdapter.send", () => {
  it("returns the message id on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ id: "re_abc" }), { status: 200 })),
    );
    const result = await new ResendAdapter("key").send(INPUT);
    expect(result.id).toBe("re_abc");
  });

  it("throws EmailSendError on 4xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad", { status: 422 })));
    await expect(new ResendAdapter("key").send(INPUT)).rejects.toBeInstanceOf(EmailSendError);
  });

  it("retries once on 5xx then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("err", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "re_retry" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await new ResendAdapter("key").send(INPUT);
    expect(result.id).toBe("re_retry");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws when the response has no id", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })));
    await expect(new ResendAdapter("key").send(INPUT)).rejects.toBeInstanceOf(EmailSendError);
  });

  it("sends the Idempotency-Key header when provided", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      new Response(JSON.stringify({ id: "re_x" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await new ResendAdapter("key").send({ ...INPUT, idempotencyKey: "scheduled-email/abc" });
    const headers = (fetchMock.mock.calls[0]?.[1]?.headers ?? {}) as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe("scheduled-email/abc");
  });
});

describe("ResendAdapter.send — E2E_MOCK", () => {
  beforeEach(() => {
    process.env.E2E_MOCK = "1";
  });
  afterEach(() => {
    delete process.env.E2E_MOCK;
  });

  it("returns a mock id without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const result = await new ResendAdapter("e2e-mock").send(INPUT);
    expect(result.id).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("getEmailSender", () => {
  afterEach(() => {
    delete process.env.E2E_MOCK;
    delete process.env.RESEND_API_KEY;
  });

  it("throws if RESEND_API_KEY is missing and not in mock mode", () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.E2E_MOCK;
    expect(() => getEmailSender()).toThrow();
  });

  it("returns a resend adapter in E2E_MOCK mode", () => {
    process.env.E2E_MOCK = "1";
    expect(getEmailSender().provider).toBe("resend");
  });
});
