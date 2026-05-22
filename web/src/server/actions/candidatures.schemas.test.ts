import { describe, it, expect } from "vitest";
import { Step1Schema, Step2Schema, Step4Schema, ManualEmailSchema } from "./candidatures.schemas";

describe("candidature wizard schemas", () => {
  it("Step1Schema requires company_name", () => {
    expect(Step1Schema.safeParse({ companyName: "Qonto" }).success).toBe(true);
    expect(Step1Schema.safeParse({ companyName: "" }).success).toBe(false);
  });

  it("Step2Schema requires manager identity fields", () => {
    expect(
      Step2Schema.safeParse({
        managerFirstName: "Jean",
        managerLastName: "Dupont",
        managerRole: "Head of Product",
      }).success,
    ).toBe(true);
    expect(Step2Schema.safeParse({ managerFirstName: "Jean" }).success).toBe(false);
  });

  it("Step4Schema accepts empty offer (optional)", () => {
    expect(Step4Schema.safeParse({}).success).toBe(true);
    expect(Step4Schema.safeParse({ offerText: "Stage produit" }).success).toBe(true);
  });

  it("ManualEmailSchema validates an email", () => {
    expect(ManualEmailSchema.safeParse({ email: "jean@qonto.com" }).success).toBe(true);
    expect(ManualEmailSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});
