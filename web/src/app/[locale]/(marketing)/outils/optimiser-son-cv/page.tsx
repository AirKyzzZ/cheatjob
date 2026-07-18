import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CvToolPage, CV_TOOL } from "../_components/cv-tool-page";

const HOSTNAME = "https://www.cheatjob.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${HOSTNAME}/${locale}/outils/${CV_TOOL.slug}`;
  return {
    title: CV_TOOL.metaTitle,
    description: CV_TOOL.metaDescription,
    alternates: { canonical: url },
    robots: locale === "fr" ? undefined : { index: false, follow: true },
    openGraph: {
      title: CV_TOOL.metaTitle,
      description: CV_TOOL.metaDescription,
      url,
      siteName: "Cheatjob",
      type: "website",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CvToolPage locale={locale} />;
}
