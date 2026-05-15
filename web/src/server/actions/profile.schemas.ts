import { z } from "zod";

const MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const LocaleEnum = z.enum(["fr", "en", "es", "de"]);

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  school: z.string().min(2).max(200).optional(),
  studyLevel: z.enum(["L3", "M1", "M2", "BTS2", "DUT2", "other"]).optional(),
});

export const UpdateLocaleSchema = z.object({
  locale: LocaleEnum,
});

export const GetUploadUrlSchema = z.object({
  filename: z.string().max(255),
  mimeType: z.enum(MIME_TYPES),
});

export const FinalizeUploadSchema = z.object({
  storagePath: z.string().max(500),
  mimeType: z.enum(MIME_TYPES),
});
