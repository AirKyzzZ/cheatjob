import { getTranslations } from "next-intl/server";
import { TOOL_CONTENT } from "../_content";
import { ToolGenerator } from "./tool-generator";
import type { ToolMode } from "@/server/integrations/ai/prompts/tool-generator";

const HOSTNAME = "https://www.cheatjob.com";

export async function ToolPage({ mode, locale }: { mode: ToolMode; locale: string }) {
  const t = await getTranslations("tools");
  const content = TOOL_CONTENT[mode];
  const canonical = `${HOSTNAME}/${locale}/outils/${content.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: content.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "SoftwareApplication",
        name: content.h1,
        applicationCategory: "BusinessApplication",
        url: canonical,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
        <header>
          <h1 className="font-serif text-[40px] leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
            {content.h1}
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-[17px] leading-relaxed text-muted-soft">
            {content.intro}
          </p>
        </header>

        <ToolGenerator mode={mode} locale={locale} />

        <section className="mt-24 border-t border-ink/10 pt-16">
          <h2 className="font-serif text-[28px] leading-tight tracking-[-0.01em] text-ink md:text-[34px]">
            Questions fréquentes
          </h2>
          <dl className="mt-10 grid gap-10">
            {content.faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-serif text-[19px] leading-snug text-ink">{item.q}</h3>
                <p className="mt-3 font-sans text-[15px] leading-relaxed text-muted-soft">
                  {item.a}
                </p>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-24 rounded-2xl bg-ink px-8 py-12 text-center text-cream md:px-12 md:py-16">
          <h2 className="mx-auto max-w-xl font-serif text-[28px] leading-tight tracking-[-0.01em] md:text-[34px]">
            {content.h1}
          </h2>
          <a
            href={`/${locale}/sign-up?from=outils-${mode}`}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-cream px-7 font-sans text-[15px] font-medium text-ink transition-opacity hover:opacity-90"
          >
            {t("signupCta")}
          </a>
        </section>
      </main>
    </>
  );
}
