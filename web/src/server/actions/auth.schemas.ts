import { z } from "zod";

export const LocaleEnum = z.enum(["fr", "en", "es", "de"]);

export const SignUpSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  locale: LocaleEnum,
});

export const SignInSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(72),
});

export const ResetRequestSchema = z.object({
  email: z.string().email().max(255),
  locale: LocaleEnum,
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8).max(72),
});
