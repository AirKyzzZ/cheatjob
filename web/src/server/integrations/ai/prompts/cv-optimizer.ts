import { z } from "zod";
import type { ChatMessage } from "../index";
import { extractJsonObject } from "../json";

export const CV_OPTIMIZER_PROMPT_VERSION = "cv-optimizer-v1";

export const CvAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  forces: z.array(z.string()).min(1),
  lacunes: z.array(z.string()).min(1),
  mots_cles: z.array(z.string()).default([]),
  conseils: z.array(z.string()).min(1),
  reecritures: z.array(z.object({ avant: z.string(), apres: z.string() })).default([]),
});
export type CvAnalysis = z.infer<typeof CvAnalysisSchema>;

const SYSTEM =
  "Tu es un coach emploi français, spécialiste des CV de jeunes diplômés. Tu analyses un CV face à une offre précise : ce qui colle, ce qui manque, ce qui se réécrit. Direct, concret, en français. Tu tutoies.";

export function buildCvOptimizerPrompt(args: {
  cv: string;
  offer: string;
  full: boolean;
}): ChatMessage[] {
  const reecrituresInstruction = args.full
    ? `"reecritures": 3 réécritures de lignes faibles du CV, chacune { "avant": string, "apres": string }`
    : `"reecritures": [] (toujours vide ici)`;
  return [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: `CV du candidat:\n${args.cv}\n\nOffre visée:\n${args.offer}\n\nRéponds STRICTEMENT en JSON, sans texte autour, avec exactement ces clés:\n{\n  "score": entier 0-100, adéquation CV/offre,\n  "forces": 2 à 4 points forts du CV pour CETTE offre (string[]),\n  "lacunes": 2 à 5 manques concrets face à l'offre (string[]),\n  "mots_cles": 5 à 10 mots-clés de l'offre absents ou trop discrets dans le CV (string[]),\n  "conseils": 3 à 6 actions concrètes pour améliorer le CV (string[]),\n  ${reecrituresInstruction}\n}\nChaque valeur texte tient sur une seule ligne.`,
    },
  ];
}

export function parseCvAnalysis(raw: string): CvAnalysis | null {
  try {
    const parsed = CvAnalysisSchema.safeParse(extractJsonObject(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
