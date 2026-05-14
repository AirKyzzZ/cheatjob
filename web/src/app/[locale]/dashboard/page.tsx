import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app.dashboard");

  return (
    <div className="flex flex-col items-center text-center py-16 md:py-24">
      <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-6">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] text-ink max-w-2xl">
        {t("emptyTitle")}
      </h1>
      <p className="mt-6 font-sans text-[16px] md:text-[17px] leading-[1.6] text-muted max-w-md">
        {t("emptyDescription")}
      </p>
      <div className="mt-10 flex flex-col items-center gap-3">
        <Button disabled className="cursor-not-allowed">
          {t("newCandidatureCta")}
          <span className="ml-3 text-[10px] uppercase tracking-[0.22em] opacity-70">
            {t("soonTag")}
          </span>
        </Button>
        <p className="font-serif italic text-[15px] text-burgundy">
          {t("soonItalic")}
        </p>
      </div>
    </div>
  );
}
