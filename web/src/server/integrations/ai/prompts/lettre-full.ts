import type { ChatMessage } from "../index";

export const LETTRE_PROMPT_VERSION = "lettre-full-v1";

const SYSTEM =
  "Tu es un coach emploi français. Rédige une lettre de motivation complète (250-350 mots) en français, ancrée dans le vrai parcours du candidat : accroche qui prouve que l'offre a été lue, un paragraphe de preuve avec des éléments concrets du CV, une conclusion qui propose un échange. Pas de formules creuses, pas de répétition du CV ligne à ligne.";

export function buildLettrePrompt(args: {
  profile: { full_name: string | null; school: string | null; about_me: string | null };
  cvExtracted: unknown;
  lettre: {
    targetRole: string;
    targetCompany: string;
    recruiterName?: string;
    offerContext: string;
  };
}): ChatMessage[] {
  const lines = [
    `Candidat: ${args.profile.full_name ?? "inconnu"}`,
    args.profile.school ? `Formation: ${args.profile.school}` : null,
    args.profile.about_me ? `À propos: ${args.profile.about_me}` : null,
    args.cvExtracted ? `CV (extrait structuré): ${JSON.stringify(args.cvExtracted)}` : null,
    `Poste visé: ${args.lettre.targetRole}`,
    `Entreprise: ${args.lettre.targetCompany}`,
    args.lettre.recruiterName ? `Destinataire: ${args.lettre.recruiterName}` : null,
    `Offre: ${args.lettre.offerContext}`,
  ].filter(Boolean);
  return [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: `${lines.join("\n")}\n\nRéponds STRICTEMENT en JSON: { "subject": "l'objet de la lettre sur une ligne", "body": "la lettre complète" }`,
    },
  ];
}
