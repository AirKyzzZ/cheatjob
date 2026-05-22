import { describe, it, expect } from "vitest";
import { QuotaExceededError, assertQuotaAvailable } from "./quotas";

describe("assertQuotaAvailable", () => {
  it("passes when quota_used < quota_total", () => {
    expect(() => assertQuotaAvailable({ quota_used: 1, quota_total: 3 })).not.toThrow();
  });

  it("throws QuotaExceededError when quota is full", () => {
    expect(() => assertQuotaAvailable({ quota_used: 3, quota_total: 3 })).toThrow(QuotaExceededError);
  });

  it("throws when quota_used somehow exceeds total", () => {
    expect(() => assertQuotaAvailable({ quota_used: 4, quota_total: 3 })).toThrow(QuotaExceededError);
  });

  it("QuotaExceededError carries an upgrade href", () => {
    try {
      assertQuotaAvailable({ quota_used: 3, quota_total: 3 });
    } catch (e) {
      expect(e).toBeInstanceOf(QuotaExceededError);
      expect((e as QuotaExceededError).upgradeHref).toBe("/dashboard/upgrade");
    }
  });
});
