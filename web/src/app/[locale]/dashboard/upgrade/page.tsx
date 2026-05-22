import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app.upgrade");

  return (
    <div className="flex flex-col items-center text-center py-16 md:py-24">
      <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-6">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] text-ink max-w-2xl">
        {t("title")}
      </h1>
      <p className="mt-6 font-serif italic text-[17px] text-burgundy">
        {t("body")}
      </p>
    </div>
  );
}
