import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { GoogleButton } from "../_components/google-button";
import { SignUpForm } from "./_components/sign-up-form";

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.signUp");

  return (
    <div>
      <h1 className="font-serif text-[40px] md:text-[48px] leading-tight tracking-[-0.02em] text-ink mb-2">
        {t("title")}
      </h1>
      <p className="font-sans text-[15px] text-muted mb-8">{t("subtitle")}</p>

      <GoogleButton locale={locale} label={t("googleCta")} />

      <div className="my-6 flex items-center gap-3 text-muted-soft text-[13px] font-sans">
        <div className="flex-1 h-px bg-border-subtle" />
        <span>{t("or")}</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <SignUpForm locale={locale} />

      <p className="mt-8 text-[14px] font-sans text-muted text-center">
        {t("hasAccount")}{" "}
        <Link href={`/${locale}/sign-in`} className="text-burgundy hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
