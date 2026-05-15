import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { GoogleButton } from "../_components/google-button";
import { SignInForm } from "./_components/sign-in-form";
import { authErrorKey } from "@/lib/auth-error-message";

const ERROR_CODE_KEYS: Record<string, string> = {
  oauth_cancelled: "oauthCancelled",
  missing_code: "missingCode",
  oauth_error: "generic",
};

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth.signIn");
  const tErrors = await getTranslations("auth.errors");

  const errorMessage = error
    ? tErrors(ERROR_CODE_KEYS[error] ?? authErrorKey(error))
    : null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-3">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-[40px] md:text-[48px] leading-tight tracking-[-0.03em] text-ink mb-2">
        {t("title")}
      </h1>
      <p className="font-sans text-[15px] text-muted mb-8">{t("subtitle")}</p>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-burgundy/20 bg-burgundy-soft px-4 py-3 text-[14px] font-sans text-burgundy"
        >
          {errorMessage}
        </div>
      )}

      <GoogleButton locale={locale} label={t("googleCta")} intent="signin" />

      <div className="my-6 flex items-center gap-3 text-muted-soft text-[13px] font-sans">
        <div className="flex-1 h-px bg-border-subtle" />
        <span>{t("or")}</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <SignInForm locale={locale} />

      <div className="mt-10 pt-6 border-t border-border-subtle text-[14px] font-sans text-muted text-center space-y-2">
        <Link
          href={`/${locale}/reset`}
          className="text-burgundy hover:underline block"
        >
          {t("forgotPassword")}
        </Link>
        <p>
          {t("noAccount")}{" "}
          <Link href={`/${locale}/sign-up`} className="text-burgundy hover:underline">
            {t("signUpLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
