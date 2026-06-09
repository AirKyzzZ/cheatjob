import { getTranslations } from "next-intl/server";
import { CvAnalyzer } from "./cv-analyzer";

const HOSTNAME = "https://www.cheatjob.com";

export const CV_TOOL = {
  slug: "optimiser-son-cv",
  metaTitle: "Optimiser son CV pour une offre : analyse gratuite · Cheatjob",
  metaDescription:
    "Colle ton CV et l'offre visée : score d'adéquation, points forts, lacunes, mots-clés manquants et conseils concrets. Gratuit, sans inscription.",
  h1: "Optimise ton CV pour l'offre que tu vises",
  intro:
    "Un CV n'est pas bon dans l'absolu, il est bon pour une offre. Colle ton CV et l'annonce : on te dit ce qui colle, ce qui manque et ce qu'il faut réécrire, en trente secondes.",
  faq: [
    {
      q: "Comment adapter son CV à une offre d'emploi ?",
      a: "Tu reprends les mots de l'offre, tu remontes les expériences qui y répondent, tu coupes le reste. Un CV adapté se lit comme une réponse à l'annonce, pas comme un historique exhaustif.",
    },
    {
      q: "C'est quoi les mots-clés ATS ?",
      a: "Les termes que les logiciels de tri et les recruteurs cherchent en premier : intitulés de poste, compétences, outils. S'ils sont dans l'offre mais pas dans ton CV, tu passes sous le radar.",
    },
    {
      q: "Quelle longueur pour un CV de jeune diplômé ?",
      a: "Une page. Pas par dogme : parce qu'un recruteur y passe trente secondes et qu'une page bien hiérarchisée se scanne mieux que deux pages remplies.",
    },
    {
      q: "Faut-il chiffrer ses expériences sur un CV ?",
      a: "Oui, dès que c'est possible. « Pilotage de 3 projets » dit quelque chose, « participation à des projets » ne dit rien. Les chiffres rendent une expérience vérifiable et mémorisable.",
    },
  ],
} as const;

export async function CvToolPage({ locale }: { locale: string }) {
  const t = await getTranslations("tools");
  const canonical = `${HOSTNAME}/${locale}/outils/${CV_TOOL.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: CV_TOOL.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "SoftwareApplication",
        name: CV_TOOL.h1,
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
            {CV_TOOL.h1}
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-[17px] leading-relaxed text-muted-soft">
            {CV_TOOL.intro}
          </p>
        </header>

        <CvAnalyzer locale={locale} />

        <section className="mt-24 border-t border-ink/10 pt-16">
          <h2 className="font-serif text-[28px] leading-tight tracking-[-0.01em] text-ink md:text-[34px]">
            Questions fréquentes
          </h2>
          <dl className="mt-10 grid gap-10">
            {CV_TOOL.faq.map((item) => (
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
            {CV_TOOL.h1}
          </h2>
          <a
            href={`/${locale}/sign-up?from=outils-cv_optimizer`}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-cream px-7 font-sans text-[15px] font-medium text-ink transition-opacity hover:opacity-90"
          >
            {t("signupCta")}
          </a>
        </section>
      </main>
    </>
  );
}
