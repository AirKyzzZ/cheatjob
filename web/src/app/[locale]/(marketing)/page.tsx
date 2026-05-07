import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/lib/i18n/config";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Receipts } from "@/components/marketing/receipts";
import { RejectionBin } from "@/components/marketing/rejection-bin";
import { Pain } from "@/components/marketing/pain";
import { Versus } from "@/components/marketing/versus";
import { Wedge } from "@/components/marketing/wedge";
import { Evidence } from "@/components/marketing/evidence";
import { Founder } from "@/components/marketing/founder";
import { AntiRec } from "@/components/marketing/anti-rec";
import { PageBreak } from "@/components/marketing/page-break";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

type LandingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const languages = Object.fromEntries(locales.map((l) => [l, `/${l}`]));

  return {
    title: { default: t("title.default"), template: t("title.template") },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `/${locale}`,
      siteName: "Cheatjob",
      locale: localeTagFor(locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function localeTagFor(locale: string): string {
  // OpenGraph expects e.g. fr_FR, en_US, es_ES, de_DE
  const map: Record<string, string> = {
    fr: "fr_FR",
    en: "en_US",
    es: "es_ES",
    de: "de_DE",
  };
  return map[locale] ?? "en_US";
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Receipts />
        <Pain />
        <RejectionBin />
        <Versus />
        <Wedge />
        <Evidence />
        <Founder />
        <AntiRec />
        <PageBreak />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
