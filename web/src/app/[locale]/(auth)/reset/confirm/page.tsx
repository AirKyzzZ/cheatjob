import { setRequestLocale, getTranslations } from "next-intl/server";
import { NewPasswordForm } from "./_components/new-password-form";

export default async function ResetConfirmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.reset");

  return (
    <div>
      <h1 className="font-serif text-[40px] md:text-[48px] leading-tight tracking-[-0.02em] text-ink mb-2">
        {t("newPasswordTitle")}
      </h1>
      <p className="font-sans text-[15px] text-muted mb-8">{t("subtitle")}</p>
      <NewPasswordForm locale={locale} />
    </div>
  );
}
