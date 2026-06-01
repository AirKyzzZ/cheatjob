import type { ChatMessage } from "../index";
export const TOOL_PROMPT_VERSION = "tool-v1";
export type ToolMode = "candidature_spontanee" | "relance" | "motivation";
export type ToolInputs = {
  targetRole: string; targetCompany: string; recruiterName?: string; you: string;
  whyCompany?: string; originalContext?: string; offerContext?: string;
};
const SYSTEM: Record<ToolMode, string> = {
  candidature_spontanee: "Tu es un coach emploi français. Rédige un email de candidature spontanée court, percutant et personnalisé (90-130 mots), en français, prêt à envoyer. Pas de blabla.",
  relance: "Tu es un coach emploi français. Rédige une relance polie et concise (60-90 mots) après une candidature ou un entretien, en français, qui donne envie de répondre sans mettre la pression.",
  motivation: "Tu es un coach emploi français. Rédige un email de motivation structuré (120-160 mots) en réponse à une offre, en français, concret et orienté valeur ajoutée.",
};
export function buildToolPrompt(mode: ToolMode, i: ToolInputs): ChatMessage[] {
  const lines = [
    `Poste visé: ${i.targetRole}`,
    `Entreprise: ${i.targetCompany}`,
    i.recruiterName ? `Recruteur: ${i.recruiterName}` : null,
    `Profil du candidat: ${i.you}`,
    i.whyCompany ? `Pourquoi cette entreprise: ${i.whyCompany}` : null,
    i.originalContext ? `Contexte de la candidature initiale: ${i.originalContext}` : null,
    i.offerContext ? `Détails de l'offre: ${i.offerContext}` : null,
  ].filter(Boolean);
  return [
    { role: "system", content: SYSTEM[mode] },
    { role: "user", content: `${lines.join("\n")}\n\nRéponds UNIQUEMENT avec un objet JSON: {"subject": "...", "body": "..."}. Le body en français, sauts de ligne avec \\n.` },
  ];
}
