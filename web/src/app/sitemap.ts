import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";

// www is the primary domain in Vercel; using apex would force every link
// through a 307 redirect.
const HOSTNAME = "https://www.cheatjob.com";

// Phase 0 only ships the landing per locale. Legal pages (Phase 1) and
// blog posts (Phase 5) extend STATIC_PATHS when those phases ship.
const STATIC_PATHS = [
  "",
  "/outils",
  "/outils/email-candidature-spontanee",
  "/outils/relancer-un-recruteur",
  "/outils/email-de-motivation",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return locales.flatMap((locale) =>
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
}
