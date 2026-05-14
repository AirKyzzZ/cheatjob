import { describe, it, expect } from "vitest";
import {
  SignUpSchema,
  SignInSchema,
  ResetRequestSchema,
  UpdatePasswordSchema,
} from "./auth";

describe("auth schemas", () => {
  it("SignUpSchema rejects short passwords", () => {
    const result = SignUpSchema.safeParse({
      email: "a@b.co",
      password: "short",
      locale: "fr",
    });
    expect(result.success).toBe(false);
  });

  it("SignUpSchema accepts valid input", () => {
    const result = SignUpSchema.safeParse({
      email: "a@b.co",
      password: "longenough123",
      locale: "fr",
    });
    expect(result.success).toBe(true);
  });

  it("SignInSchema requires email + password", () => {
    expect(SignInSchema.safeParse({ email: "a@b.co" }).success).toBe(false);
    expect(SignInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });

  it("ResetRequestSchema validates locale enum", () => {
    expect(ResetRequestSchema.safeParse({ email: "a@b.co", locale: "fr" }).success).toBe(true);
    expect(ResetRequestSchema.safeParse({ email: "a@b.co", locale: "xx" }).success).toBe(false);
  });

  it("UpdatePasswordSchema rejects short passwords", () => {
    expect(UpdatePasswordSchema.safeParse({ password: "short" }).success).toBe(false);
    expect(UpdatePasswordSchema.safeParse({ password: "longenough" }).success).toBe(true);
  });
});
