import { describe, it, expect } from "vitest";
import { OnboardingSchema } from "./onboarding.schemas";

describe("OnboardingSchema", () => {
  it("requires fullName", () => {
    expect(
      OnboardingSchema.safeParse({ school: "ESSEC", studyLevel: "M1", locale: "fr" })
        .success,
    ).toBe(false);
  });
  it("validates studyLevel enum", () => {
    expect(
      OnboardingSchema.safeParse({
        fullName: "Test",
        school: "ESSEC",
        studyLevel: "PhD",
        locale: "fr",
      }).success,
    ).toBe(false);
  });
  it("accepts valid input", () => {
    expect(
      OnboardingSchema.safeParse({
        fullName: "Test User",
        school: "ESSEC",
        studyLevel: "M1",
        locale: "fr",
      }).success,
    ).toBe(true);
  });
});
