import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, getProfileMock, decrementQuotaMock, complete } = vi.hoisted(() => ({
  getUser: vi.fn(),
  getProfileMock: vi.fn(),
  decrementQuotaMock: vi.fn(),
  complete: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  getServerClient: async () => ({ auth: { getUser } }),
}));
vi.mock("@/lib/supabase/admin", () => ({ getServiceClient: () => ({}) }));
vi.mock("@/lib/db/profiles", () => ({ getProfile: getProfileMock }));
vi.mock("@/lib/billing/quotas", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/billing/quotas")>();
  return { ...actual, decrementQuota: decrementQuotaMock };
});
vi.mock("@/server/integrations/ai/openrouter", () => ({
  getAIProvider: () => ({ complete }),
}));

import { writeLettre } from "./lettre-writer";

const INPUT = {
  targetRole: "Chef de projet",
  targetCompany: "Qonto",
  offerContext: "o".repeat(60),
};
const PROFILE = {
  full_name: "Test",
  school: "KEDGE",
  about_me: "M2",
  cv_extracted: { skills: ["x"] },
  quota_used: 0,
  quota_total: 3,
};

beforeEach(() => {
  getUser.mockReset();
  getProfileMock.mockReset();
  decrementQuotaMock.mockReset();
  complete.mockReset();
  getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  getProfileMock.mockResolvedValue(PROFILE);
  decrementQuotaMock.mockResolvedValue(true);
});

describe("writeLettre", () => {
  it("throws when not authenticated", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(writeLettre(INPUT)).rejects.toThrow();
  });

  it("rejects missing role/company or undersized offer", async () => {
    expect(await writeLettre({ ...INPUT, targetRole: "  " })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(await writeLettre({ ...INPUT, offerContext: "court" })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(await writeLettre({ ...INPUT, targetRole: "x".repeat(201) })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(await writeLettre({ ...INPUT, targetCompany: "x".repeat(201) })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(await writeLettre({ ...INPUT, offerContext: "o".repeat(6001) })).toEqual({
      ok: false,
      error: "invalid_input",
    });
  });

  it("returns quota_exceeded when out of credits", async () => {
    getProfileMock.mockResolvedValue({ ...PROFILE, quota_used: 3 });
    expect(await writeLettre(INPUT)).toEqual({ ok: false, error: "quota_exceeded" });
    expect(complete).not.toHaveBeenCalled();
  });

  it("returns the letter and decrements once on success", async () => {
    complete.mockResolvedValue({
      text: JSON.stringify({ subject: "Candidature", body: "Ma lettre." }),
      model: "m",
      costUsd: 0,
    });
    const res = await writeLettre(INPUT);
    expect(res).toEqual({ ok: true, subject: "Candidature", body: "Ma lettre." });
    expect(decrementQuotaMock).toHaveBeenCalledTimes(1);
  });

  it("does not decrement on unparseable output", async () => {
    complete.mockResolvedValue({ text: "garbage", model: "m", costUsd: 0 });
    expect(await writeLettre(INPUT)).toEqual({ ok: false, error: "generation_failed" });
    expect(decrementQuotaMock).not.toHaveBeenCalled();
  });

  it("returns quota_exceeded when a concurrent call consumed the last credit", async () => {
    complete.mockResolvedValue({
      text: JSON.stringify({ subject: "S", body: "B" }),
      model: "m",
      costUsd: 0,
    });
    decrementQuotaMock.mockResolvedValue(false);
    expect(await writeLettre(INPUT)).toEqual({ ok: false, error: "quota_exceeded" });
  });
});
