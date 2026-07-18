import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, complete, getUser, getProfileMock, decrementQuotaMock } = vi.hoisted(() => ({
  rpc: vi.fn(),
  complete: vi.fn(),
  getUser: vi.fn(),
  getProfileMock: vi.fn(),
  decrementQuotaMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["x-forwarded-for", "1.2.3.4"]])),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getServiceClient: () => ({ rpc }),
}));
vi.mock("@/server/integrations/ai/openrouter", () => ({
  getAIProvider: () => ({ complete }),
}));
vi.mock("@/lib/supabase/server", () => ({
  getServerClient: async () => ({ auth: { getUser } }),
}));
vi.mock("@/lib/db/profiles", () => ({ getProfile: getProfileMock }));
vi.mock("@/lib/billing/quotas", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/billing/quotas")>();
  return { ...actual, decrementQuota: decrementQuotaMock };
});

import { analyzeCvPublic, analyzeCvFull } from "./cv-optimizer";

const VALID_ANALYSIS = JSON.stringify({
  score: 60,
  forces: ["a"],
  lacunes: ["b"],
  mots_cles: [],
  conseils: ["c"],
  reecritures: [],
});

const INPUT = { cvText: "x".repeat(300), offerText: "y".repeat(100) };

beforeEach(() => {
  rpc.mockReset();
  complete.mockReset();
});

describe("analyzeCvPublic", () => {
  it("blocks honeypot submissions without consuming the rate limit", async () => {
    const res = await analyzeCvPublic({ ...INPUT, honeypot: "bot" });
    expect(res).toEqual({ ok: false, error: "blocked" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects undersized or oversized inputs", async () => {
    expect(await analyzeCvPublic({ cvText: "court", offerText: INPUT.offerText })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(
      await analyzeCvPublic({ cvText: "x".repeat(8001), offerText: INPUT.offerText }),
    ).toEqual({ ok: false, error: "invalid_input" });
  });

  it("returns rate_limited when tool_consume denies", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const res = await analyzeCvPublic(INPUT);
    expect(res).toEqual({ ok: false, error: "rate_limited" });
    expect(rpc).toHaveBeenCalledWith("tool_consume", { p_ip: "1.2.3.4", p_cap: 5 });
  });

  it("returns the parsed analysis on success", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    complete.mockResolvedValue({ text: VALID_ANALYSIS, model: "m", costUsd: 0 });
    const res = await analyzeCvPublic(INPUT);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.analysis.score).toBe(60);
  });

  it("returns generation_failed on unparseable output", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    complete.mockResolvedValue({ text: "pas du json", model: "m", costUsd: 0 });
    expect(await analyzeCvPublic(INPUT)).toEqual({ ok: false, error: "generation_failed" });
  });
});

describe("analyzeCvFull", () => {
  const PROFILE = {
    quota_used: 1,
    quota_total: 3,
    about_me: "Je cherche un CDI",
    cv_extracted: { full_name: "Test", skills: ["x"], raw: "cv brut" },
  };

  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    getProfileMock.mockResolvedValue(PROFILE);
    decrementQuotaMock.mockReset();
    decrementQuotaMock.mockResolvedValue(true);
  });

  it("throws when not authenticated", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(analyzeCvFull({ offerText: "y".repeat(100) })).rejects.toThrow();
  });

  it("returns no_cv when the profile has no parsed CV", async () => {
    getProfileMock.mockResolvedValue({ ...PROFILE, cv_extracted: null });
    expect(await analyzeCvFull({ offerText: "y".repeat(100) })).toEqual({
      ok: false,
      error: "no_cv",
    });
  });

  it("returns quota_exceeded without calling the model", async () => {
    getProfileMock.mockResolvedValue({ ...PROFILE, quota_used: 3 });
    expect(await analyzeCvFull({ offerText: "y".repeat(100) })).toEqual({
      ok: false,
      error: "quota_exceeded",
    });
    expect(complete).not.toHaveBeenCalled();
  });

  it("decrements quota exactly once on success", async () => {
    complete.mockResolvedValue({ text: VALID_ANALYSIS, model: "m", costUsd: 0 });
    const res = await analyzeCvFull({ offerText: "y".repeat(100) });
    expect(res.ok).toBe(true);
    expect(decrementQuotaMock).toHaveBeenCalledTimes(1);
  });

  it("does NOT decrement quota when generation fails", async () => {
    complete.mockResolvedValue({ text: "garbage", model: "m", costUsd: 0 });
    expect(await analyzeCvFull({ offerText: "y".repeat(100) })).toEqual({
      ok: false,
      error: "generation_failed",
    });
    expect(decrementQuotaMock).not.toHaveBeenCalled();
  });

  it("returns quota_exceeded when a concurrent call consumed the last credit", async () => {
    complete.mockResolvedValue({ text: VALID_ANALYSIS, model: "m", costUsd: 0 });
    decrementQuotaMock.mockResolvedValue(false);
    expect(await analyzeCvFull({ offerText: "y".repeat(100) })).toEqual({
      ok: false,
      error: "quota_exceeded",
    });
  });
});
