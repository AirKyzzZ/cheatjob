import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { BetaLocaleBanner } from "./_components/beta-locale-banner";
import { SiteJsonLd } from "@/components/seo/site-jsonld";

// WaitlistProvider lives inside AnalyticsProvider (one level up). Don't
// re-mount it here or two WaitlistModals will render in the DOM.

type MarketingLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({ children, params }: MarketingLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteJsonLd />
      <BetaLocaleBanner locale={locale} />
      <div style={{ paddingTop: "var(--beta-banner-h, 0px)" }}>{children}</div>
    </>
  );
}
