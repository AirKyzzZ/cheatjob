import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ResetRequestForm } from "./_components/reset-request-form";

export default async function ResetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.reset");

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-3">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-[40px] md:text-[48px] leading-tight tracking-[-0.03em] text-ink mb-2">
        {t("title")}
      </h1>
      <p className="font-sans text-[15px] text-muted mb-8">{t("subtitle")}</p>

      <ResetRequestForm locale={locale} />

      <div className="mt-10 pt-6 border-t border-border-subtle text-[14px] font-sans text-muted text-center">
        <Link href={`/${locale}/sign-in`} className="text-burgundy hover:underline">
          {t("backToSignIn")}
        </Link>
      </div>
    </div>
  );
}
