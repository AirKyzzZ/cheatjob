import type { ChatMessage } from "../index";

export const DRAFT_PROMPT_VERSION = "draft-initial@1";

type DraftContext = {
  profile: {
    full_name: string | null;
    school: string | null;
    study_level: string | null;
    about_me: string | null;
  };
  cvExtracted: unknown | null;
  candidature: {
    company_name: string;
    target_role: string | null;
    manager_first_name: string | null;
    manager_role: string | null;
    offer_text: string | null;
  };
};

const SYSTEM = `Tu es un assistant qui rédige des emails de candidature spontanée pour des étudiants français en recherche de stage ou d'alternance.

Règles:
- Écris en français, ton direct et sincère, jamais corporate ni flatteur.
- Un email court: 110-150 mots maximum, une accroche concrète, une raison d'écrire à CETTE personne, une demande claire (un échange de 15 minutes).
- Pas de formules creuses ("je me permets de", "n'hésitez pas").
- Appuie-toi sur un élément réel du parcours du candidat.
- Réponds STRICTEMENT en JSON: {"subject": "...", "body": "..."} sans texte autour.`;

export function buildDraftPrompt(ctx: DraftContext): ChatMessage[] {
  const candidateBlock = [
    "PROFIL DU CANDIDAT",
    `Nom: ${ctx.profile.full_name ?? "—"}`,
    `École: ${ctx.profile.school ?? "—"}`,
    `Niveau: ${ctx.profile.study_level ?? "—"}`,
    `À propos: ${ctx.profile.about_me ?? "—"}`,
    `CV (données extraites): ${ctx.cvExtracted ? JSON.stringify(ctx.cvExtracted) : "aucun CV"}`,
  ].join("\n");

  const candidatureBlock = [
    "CONTEXTE DE LA CANDIDATURE",
    `Entreprise: ${ctx.candidature.company_name}`,
    `Poste visé: ${ctx.candidature.target_role ?? "—"}`,
    `Destinataire: ${ctx.candidature.manager_first_name ?? "le recruteur"} (${ctx.candidature.manager_role ?? "—"})`,
    `Offre: ${ctx.candidature.offer_text ?? "aucune offre fournie"}`,
    "",
    "Rédige l'email de candidature spontanée.",
  ].join("\n");

  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: candidateBlock },
    { role: "user", content: candidatureBlock },
  ];
}
