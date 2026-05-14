import { setRequestLocale, getTranslations } from "next-intl/server";
import { getServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { OnboardingForm } from "./_components/onboarding-form";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("onboarding");

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await getProfile(supabase, user.id) : null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-3">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-[40px] md:text-[48px] leading-tight tracking-[-0.03em] text-ink mb-3">
        {t("title")}
      </h1>
      <p className="font-serif italic text-[18px] md:text-[20px] text-burgundy mb-10">
        {t("accentLine")}
      </p>
      <OnboardingForm locale={locale} initialFullName={profile?.full_name ?? ""} />
    </div>
  );
}
