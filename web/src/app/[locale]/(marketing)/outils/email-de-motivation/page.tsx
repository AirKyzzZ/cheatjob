import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TOOL_CONTENT } from "../_content";
import { ToolPage } from "../_components/tool-page";

const MODE = "motivation" as const;
const HOSTNAME = "https://www.cheatjob.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = TOOL_CONTENT[MODE];
  const url = `${HOSTNAME}/${locale}/outils/${content.slug}`;
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
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
  return <ToolPage mode={MODE} locale={locale} />;
}
