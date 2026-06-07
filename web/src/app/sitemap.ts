import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getAllSlugs } from "@/lib/blog/posts";

const HOSTNAME = "https://www.cheatjob.com";

const STATIC_PATHS = [
  "",
  "/outils",
  "/outils/email-candidature-spontanee",
  "/outils/relancer-un-recruteur",
  "/outils/email-de-motivation",
  "/blog",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries = locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${HOSTNAME}/${locale}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1.0 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${HOSTNAME}/${l}${path}`]),
        ),
      },
    })),
  );

  const slugs = await getAllSlugs();
  const blogEntries = slugs.map((slug) => ({
    url: `${HOSTNAME}/fr/blog/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
