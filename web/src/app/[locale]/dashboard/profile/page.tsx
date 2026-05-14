import { setRequestLocale, getTranslations } from "next-intl/server";
import { getServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { getCvDownloadUrl } from "@/server/actions/profile";
import { IdentityCard } from "./_components/identity-card";
import { LocaleCard } from "./_components/locale-card";
import { CvCard } from "./_components/cv-card";
import { SignOutButton } from "./_components/sign-out-button";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app.profile");

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getProfile(supabase, user.id);
  if (!profile) throw new Error("Profile not found");

  const cvDownloadUrl = profile.cv_storage_path ? await getCvDownloadUrl() : null;

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-3">
          {t("eyebrow")}
        </p>
        <h1 className="font-serif text-[40px] md:text-[48px] leading-tight tracking-[-0.02em] text-ink">
          {t("title")}
        </h1>
      </header>

      <IdentityCard profile={profile} />
      <LocaleCard locale={locale} currentLocale={profile.locale} />
      <CvCard
        cvStoragePath={profile.cv_storage_path ?? null}
        cvUploadedAt={profile.cv_uploaded_at ?? null}
        downloadUrl={cvDownloadUrl}
        locale={locale}
      />

      <div className="pt-8 mt-4 border-t border-border-subtle">
        <h2 className="font-serif text-[22px] tracking-[-0.01em] text-ink mb-2">
          {t("dangerZone")}
        </h2>
        <p className="text-[14px] font-sans text-muted mb-4">
          {t("deleteAccountComingSoon")}
        </p>
        <SignOutButton locale={locale} label={t("signOutLabel")} />
      </div>
    </div>
  );
}
