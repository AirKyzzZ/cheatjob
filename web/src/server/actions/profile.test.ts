import { describe, it, expect } from "vitest";
import {
  UpdateProfileSchema,
  UpdateLocaleSchema,
  GetUploadUrlSchema,
  FinalizeUploadSchema,
} from "./profile";

describe("profile schemas", () => {
  it("UpdateProfileSchema accepts partial updates", () => {
    expect(UpdateProfileSchema.safeParse({ fullName: "Maxime" }).success).toBe(true);
    expect(UpdateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("UpdateProfileSchema rejects too-short fullName", () => {
    expect(UpdateProfileSchema.safeParse({ fullName: "X" }).success).toBe(false);
  });

  it("UpdateLocaleSchema rejects unknown locale", () => {
    expect(UpdateLocaleSchema.safeParse({ locale: "fr" }).success).toBe(true);
    expect(UpdateLocaleSchema.safeParse({ locale: "xx" }).success).toBe(false);
  });

  it("GetUploadUrlSchema validates mime types", () => {
    expect(
      GetUploadUrlSchema.safeParse({
        filename: "cv.pdf",
        mimeType: "application/pdf",
      }).success,
    ).toBe(true);
    expect(
      GetUploadUrlSchema.safeParse({
        filename: "cv.exe",
        mimeType: "application/x-msdownload",
      }).success,
    ).toBe(false);
  });

  it("FinalizeUploadSchema requires storagePath", () => {
    expect(
      FinalizeUploadSchema.safeParse({
        storagePath: "abc/cv.pdf",
        mimeType: "application/pdf",
      }).success,
    ).toBe(true);
    expect(
      FinalizeUploadSchema.safeParse({ mimeType: "application/pdf" }).success,
    ).toBe(false);
  });
});
