import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TOOL_CONTENT, TOOL_ORDER } from "./_content";

const HOSTNAME = "https://www.cheatjob.com";
const HUB_TITLE = "Outils d'emploi gratuits : emails prêts à envoyer · Cheatjob";
const HUB_DESCRIPTION =
  "Des générateurs d'emails pensés pour décrocher un entretien : candidature spontanée, relance de recruteur, email de motivation. Gratuit, sans inscription.";

const SLUG_ONE_LINER: Record<string, string> = {
  "email-candidature-spontanee": "Le message qui atterrit chez le bon manager, pas dans une boîte RH.",
  "relancer-un-recruteur": "Assez pour exister, jamais assez pour agacer.",
  "email-de-motivation": "Une réponse précise à une offre précise, pas une lettre poussiéreuse.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${HOSTNAME}/${locale}/outils`;
  return {
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: HUB_TITLE,
      description: HUB_DESCRIPTION,
      url,
      siteName: "Cheatjob",
      type: "website",
    },
  };
}

export default async function OutilsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
      <header>
        <p className="mb-5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-muted-soft">
          Outils gratuits
        </p>
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
          Les bons mots, au bon moment, à la bonne personne.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-[17px] leading-relaxed text-muted-soft">
          Trois générateurs d&apos;emails pensés pour décrocher un entretien. Tu donnes le contexte, on écrit le message qui ouvre la porte. Gratuit, sans inscription.
        </p>
      </header>

      <div className="mt-16 grid gap-4">
        {TOOL_ORDER.map((mode) => {
          const content = TOOL_CONTENT[mode];
          return (
            <a
              key={mode}
              href={`/${locale}/outils/${content.slug}`}
              className="group block rounded-2xl border border-ink/10 bg-white p-7 transition-colors hover:border-burgundy/40"
            >
              <h2 className="font-serif text-[24px] leading-snug text-ink group-hover:text-burgundy transition-colors">
                {content.h1}
              </h2>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-muted-soft">
                {SLUG_ONE_LINER[content.slug]}
              </p>
            </a>
          );
        })}
      </div>
    </main>
  );
}
