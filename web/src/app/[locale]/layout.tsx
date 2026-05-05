import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { localeDisplay } from "@/lib/i18n/locale-data";
import { routing } from "@/lib/i18n/routing";
import type { Locale } from "@/types/locale";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const display = localeDisplay[locale as Locale];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AnalyticsProvider>
        <div lang={display.htmlLang} className="contents">
          {children}
        </div>
      </AnalyticsProvider>
    </NextIntlClientProvider>
  );
}
