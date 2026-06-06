"use client";

import { useTranslations } from "next-intl";
import { track, EVENTS } from "@/lib/analytics/events";

export function BlogCta({
  locale,
  tool,
  slug,
}: {
  locale: string;
  tool: string;
  slug: string;
}) {
  const t = useTranslations("blog");
  return (
    <aside className="mt-16 rounded-2xl bg-ink p-8 text-cream">
      <p className="font-serif text-[24px] leading-snug">{t("ctaTitle")}</p>
      <p className="mt-3 font-sans text-[15px] leading-relaxed text-cream/70">{t("ctaBody")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/${locale}/outils/${tool}`}
          onClick={() => track(EVENTS.BlogToolClicked, { slug, tool })}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-cream px-5 font-sans text-[14px] font-medium text-ink transition-opacity hover:opacity-90"
        >
          {t("ctaTool")}
        </a>
        <a
          href={`/${locale}/sign-up?from=blog-${slug}`}
          onClick={() => track(EVENTS.BlogSignupClicked, { slug, tool })}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-cream/30 px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-cream/10"
        >
          {t("ctaSignup")}
        </a>
      </div>
    </aside>
  );
}
