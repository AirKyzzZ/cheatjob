import type { BlogTool } from "./schema";

export type BlogTopic = {
  slug: string;
  title: string;
  tool: BlogTool;
  angle: string;
};

export const BLOG_QUEUE: BlogTopic[] = [
  {
    slug: "candidature-spontanee-exemple",
    title: "Candidature spontanée : l'exemple qui décroche un entretien",
    tool: "email-candidature-spontanee",
    angle: "Un modèle concret, et pourquoi viser le manager plutôt que la boîte RH.",
  },
  {
    slug: "relancer-recruteur-sans-etre-lourd",
    title: "Relancer un recruteur sans passer pour un lourd",
    tool: "relancer-un-recruteur",
    angle: "Le bon timing, le bon ton, le bon nombre de relances.",
  },
  {
    slug: "email-de-motivation-vs-lettre",
    title: "Email de motivation : ce qui remplace la lettre poussiéreuse",
    tool: "email-de-motivation",
    angle: "Répondre à une offre précise, pas réciter un modèle générique.",
  },
  {
    slug: "trouver-email-manager",
    title: "Trouver l'email du bon manager pour une candidature spontanée",
    tool: "email-candidature-spontanee",
    angle: "Des méthodes pour atteindre le décideur, pas la boîte RH.",
  },
  {
    slug: "relance-apres-entretien",
    title: "La relance après entretien qui fait vraiment la différence",
    tool: "relancer-un-recruteur",
    angle: "Le message de remerciement qui relance sans en faire trop.",
  },
];
