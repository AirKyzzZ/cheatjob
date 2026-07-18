import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { CvOptimizerForm } from "./_components/cv-optimizer-form";

export default async function CvOptimizerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/sign-in`);

  const profile = await getProfile(supabase, user.id);
  return (
    <CvOptimizerForm
      locale={locale}
      hasCv={Boolean(profile?.cv_extracted)}
      quotaRemaining={(profile?.quota_total ?? 0) - (profile?.quota_used ?? 0)}
    />
  );
}
