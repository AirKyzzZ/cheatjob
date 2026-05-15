"use server";

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { updateProfile, markOnboarded } from "@/lib/db/profiles";
import { OnboardingSchema } from "./onboarding.schemas";

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
