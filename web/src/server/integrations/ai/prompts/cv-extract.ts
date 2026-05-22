import type { ChatMessage } from "../index";

export const CV_EXTRACT_PROMPT_VERSION = "cv-extract@1";

const SYSTEM = `Tu extrais des données structurées d'un CV étudiant.
Réponds STRICTEMENT en JSON, sans texte autour, avec ce schéma:
{
  "full_name": string|null,
  "school": string|null,
  "field_of_study": string|null,
  "experiences": [{"title": string, "org": string, "dates": string, "summary": string}],
  "skills": [string],
  "projects": [{"name": string, "summary": string}],
  "languages": [string]
}
Si une information est absente, mets null ou un tableau vide. N'invente rien.`;

export function buildCvExtractPrompt(rawText: string): ChatMessage[] {
  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: `CV À ANALYSER:\n\n${rawText}` },
  ];
}
