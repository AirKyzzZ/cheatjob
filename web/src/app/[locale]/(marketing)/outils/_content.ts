import type { ToolMode, ToolInputs } from "@/server/integrations/ai/prompts/tool-generator";

export type ToolContent = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  faq: { q: string; a: string }[];
  fields: (keyof ToolInputs)[];
};

export const TOOL_CONTENT: Record<ToolMode, ToolContent> = {
  candidature_spontanee: {
    slug: "email-candidature-spontanee",
    metaTitle: "Générateur d'email de candidature spontanée · Cheatjob",
    metaDescription:
      "Génère un email de candidature spontanée personnalisé, prêt à envoyer au recruteur qui décide. Donne le poste et l'entreprise, on rédige le reste.",
    h1: "Générateur d'email de candidature spontanée",
    intro:
      "Un modèle d'email de candidature spontanée ne te ressemble jamais. Celui-ci, si. Tu donnes le poste et l'entreprise, on écrit le message qui atterrit chez le bon manager.",
    faq: [
      {
        q: "C'est quoi une bonne candidature spontanée ?",
        a: "Un message court, adressé à la personne qui recrute, pas à une boîte RH. Trois choses : qui tu es, pourquoi cette entreprise précisément, ce que tu peux faire pour elle. Quatre lignes suffisent.",
      },
      {
        q: "À qui envoyer une candidature spontanée ?",
        a: "Au manager de l'équipe que tu vises, ou au fondateur dans une petite structure. Surtout pas à recrutement@. Le décideur lit ses propres mails, le service RH trie des piles.",
      },
      {
        q: "Quel objet pour un email de candidature spontanée ?",
        a: "Précis et sans formule creuse. Le poste visé et une accroche en cinq mots font mieux que « Candidature spontanée ». L'objet décide si ton message est ouvert ou ignoré.",
      },
      {
        q: "Faut-il joindre son CV à une candidature spontanée ?",
        a: "Pas au premier message. Tu donnes envie d'abord, le CV vient quand le recruteur le demande. Un mail avec pièce jointe non sollicitée finit souvent en spam.",
      },
    ],
    fields: ["targetRole", "targetCompany", "recruiterName", "you", "whyCompany"],
  },
  relance: {
    slug: "relancer-un-recruteur",
    metaTitle: "Relancer un recruteur : email de relance · Cheatjob",
    metaDescription:
      "Relancer un recruteur sans le braquer. On rédige un email de relance court et poli qui rappelle ta candidature et donne envie de répondre, en 30 secondes.",
    h1: "Relancer un recruteur, sans en faire trop",
    intro:
      "Relancer un recruteur, c'est un art : assez pour exister, jamais assez pour agacer. On écrit le message qui rappelle ta candidature et ouvre la porte, sans la forcer.",
    faq: [
      {
        q: "Au bout de combien de temps relancer un recruteur ?",
        a: "Entre sept et dix jours après ta candidature ou ton entretien. Avant, tu parais pressé. Après deux semaines de silence, une seconde relance courte reste légitime.",
      },
      {
        q: "Comment relancer un recruteur sans le braquer ?",
        a: "Reste bref, poli et concret. Tu rappelles le poste, tu redis ton intérêt en une phrase, tu laisses la main. Pas de reproche, pas de « je me permets de revenir vers vous » à rallonge.",
      },
      {
        q: "Que dire dans un email de relance ?",
        a: "Le contexte en une ligne, ce qui te motive toujours, une question simple qui appelle une réponse. L'idée n'est pas de réexpliquer ton CV mais de relancer la conversation.",
      },
      {
        q: "Combien de fois peut-on relancer ?",
        a: "Deux, espacées. Après une relance et un rappel restés sans réponse, tu passes à autre chose. Le silence répété est lui aussi une réponse, garde ton énergie pour les boîtes qui répondent.",
      },
    ],
    fields: ["targetRole", "targetCompany", "recruiterName", "you", "originalContext"],
  },
  motivation: {
    slug: "email-de-motivation",
    metaTitle: "Générateur d'email de motivation pour une offre · Cheatjob",
    metaDescription:
      "Rédige un email de motivation en réponse à une offre, concret et orienté valeur ajoutée. Tu colles l'offre, on écrit le message qui te démarque.",
    h1: "Générateur d'email de motivation",
    intro:
      "Un email de motivation n'est pas une lettre poussiéreuse en trois paragraphes. C'est une réponse précise à une offre précise. Tu colles le contexte, on écrit ce qui compte vraiment.",
    faq: [
      {
        q: "Quelle différence entre lettre et email de motivation ?",
        a: "Le format. L'email va droit au but, se lit sur un téléphone, déclenche une réponse rapide. La lettre formelle, elle, finit souvent au fond d'un dossier que personne n'ouvre.",
      },
      {
        q: "Que mettre dans un email de motivation ?",
        a: "Pourquoi cette offre, ce que tu apportes concrètement, un exemple qui le prouve. On parle de l'entreprise et de ses besoins, pas seulement de tes envies de progression.",
      },
      {
        q: "Quelle longueur pour un email de motivation ?",
        a: "Entre cent vingt et cent soixante mots. Assez pour montrer que tu as lu l'offre, assez court pour être lu jusqu'au bout. Personne ne lit un pavé en ligne.",
      },
      {
        q: "Comment finir un email de motivation ?",
        a: "Par une ouverture claire : ta disponibilité pour un échange. Tu proposes la suite plutôt que d'attendre qu'on te la propose. C'est ce qui sépare une réponse d'un silence.",
      },
    ],
    fields: ["targetRole", "targetCompany", "recruiterName", "you", "offerContext"],
  },
  lettre: {
    slug: "lettre-de-motivation",
    metaTitle: "Générateur de lettre de motivation gratuit · Cheatjob",
    metaDescription:
      "Génère une lettre de motivation complète et personnalisée en 30 secondes. Tu colles l'offre et ton profil, on écrit la lettre qui se lit jusqu'au bout. Gratuit.",
    h1: "Générateur de lettre de motivation",
    intro:
      "Une lettre de motivation n'a pas besoin d'être un pensum en trois paragraphes recopié d'un modèle. Tu donnes l'offre et ton profil, on écrit une lettre précise, qui parle de l'entreprise autant que de toi.",
    faq: [
      {
        q: "Comment commencer une lettre de motivation ?",
        a: "Par l'offre, pas par toi. Une première phrase qui montre que tu as compris le poste et le contexte de l'entreprise fait plus qu'un « Actuellement étudiant en… ». L'accroche décide si la suite est lue.",
      },
      {
        q: "Quelle longueur pour une lettre de motivation ?",
        a: "Entre 220 et 300 mots. Une page maximum, trois paragraphes courts. Le recruteur y passe moins d'une minute : chaque phrase doit mériter sa place.",
      },
      {
        q: "Lettre de motivation ou email de motivation ?",
        a: "L'email quand tu contactes quelqu'un directement, la lettre quand l'offre la demande ou qu'un dossier de candidature l'exige. Les deux doivent être précis ; seul le format change.",
      },
      {
        q: "Faut-il personnaliser chaque lettre ?",
        a: "Oui, et c'est exactement ce qui élimine la concurrence. La même lettre envoyée partout se repère en deux lignes. Une lettre qui cite le poste, l'équipe et un vrai point de l'offre sort du lot immédiatement.",
      },
    ],
    fields: ["targetRole", "targetCompany", "recruiterName", "you", "offerContext"],
  },
};

export const TOOL_ORDER: ToolMode[] = ["candidature_spontanee", "relance", "motivation", "lettre"];
