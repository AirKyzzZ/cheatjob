import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { WaitlistProvider } from "@/components/waitlist/waitlist-context";
import { BetaLocaleBanner } from "./_components/beta-locale-banner";

type MarketingLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({ children, params }: MarketingLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <WaitlistProvider>
      <BetaLocaleBanner locale={locale} />
      {children}
    </WaitlistProvider>
  );
}
