import type { ChatMessage } from "../index";
export const TOOL_PROMPT_VERSION = "tool-v1";
export type ToolMode = "candidature_spontanee" | "relance" | "motivation" | "lettre";
export type ToolInputs = {
  targetRole: string; targetCompany: string; recruiterName?: string; you: string;
  whyCompany?: string; originalContext?: string; offerContext?: string;
};
const SYSTEM: Record<ToolMode, string> = {
  candidature_spontanee: "Tu es un coach emploi français. Rédige un email de candidature spontanée court, percutant et personnalisé (90-130 mots), en français, prêt à envoyer. Pas de blabla.",
  relance: "Tu es un coach emploi français. Rédige une relance polie et concise (60-90 mots) après une candidature ou un entretien, en français, qui donne envie de répondre sans mettre la pression.",
  motivation: "Tu es un coach emploi français. Rédige un email de motivation structuré (120-160 mots) en réponse à une offre, en français, concret et orienté valeur ajoutée.",
  lettre:
    "Tu es un coach emploi français. Rédige une lettre de motivation complète (220-300 mots) en français : une accroche directe qui montre que l'offre a été lue, une preuve concrète de valeur tirée du profil, une conclusion qui propose un échange. Pas de « Madame, Monsieur » si un destinataire est connu, pas de formules creuses.",
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
    {
      role: "user",
      content: `${lines.join("\n")}\n\nRéponds EXACTEMENT dans ce format, sans rien d'autre, sans JSON, sans balises :\nObjet: <l'objet de l'email sur une seule ligne>\nMessage:\n<le corps de l'email, en français, sur plusieurs lignes si besoin>`,
    },
  ];
}

// Parse the "Objet: …\nMessage:\n…" contract. Deliberately NOT JSON: a cheap model
// routinely emits raw unescaped newlines inside a JSON string, which JSON.parse
// rejects. A line-delimited format is newline-proof.
export function parseToolEmail(raw: string): { subject: string; body: string } | null {
  const text = raw.replace(/```/g, "").trim();
  const subjectMatch = text.match(/^\s*objet\s*:\s*(.+?)\s*$/im);
  if (!subjectMatch) return null;
  const subject = subjectMatch[1].trim();
  const msgMatch = text.match(/^\s*message\s*:/im);
  const after =
    msgMatch && msgMatch.index !== undefined
      ? text.slice(msgMatch.index + msgMatch[0].length)
      : text.slice((subjectMatch.index ?? 0) + subjectMatch[0].length);
  const body = after.trim();
  if (!subject || !body) return null;
  return { subject, body };
}
