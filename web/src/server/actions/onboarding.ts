"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { updateProfile, markOnboarded } from "@/lib/db/profiles";

export const OnboardingSchema = z.object({
  fullName: z.string().min(2).max(100),
  school: z.string().min(2).max(200),
  studyLevel: z.enum(["L3", "M1", "M2", "BTS2", "DUT2", "Autre"]),
  locale: z.enum(["fr", "en", "es", "de"]),
});

export async function completeOnboarding(input: unknown) {
  const parsed = OnboardingSchema.parse(input);
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await updateProfile(supabase, user.id, {
    full_name: parsed.fullName,
    school: parsed.school,
    study_level: parsed.studyLevel === "Autre" ? "other" : parsed.studyLevel,
    locale: parsed.locale,
  });
  await markOnboarded(supabase, user.id);

  redirect(`/${parsed.locale}/dashboard`);
}
