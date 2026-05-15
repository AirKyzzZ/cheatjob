import { z } from "zod";

export const OnboardingSchema = z.object({
  fullName: z.string().min(2).max(100),
  school: z.string().min(2).max(200),
  studyLevel: z.enum(["L3", "M1", "M2", "BTS2", "DUT2", "Autre"]),
  locale: z.enum(["fr", "en", "es", "de"]),
});
