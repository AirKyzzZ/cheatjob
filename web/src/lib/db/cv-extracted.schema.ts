import { z } from "zod";
import { extractJsonObject } from "@/server/integrations/ai/json";

export const CvExtractedSchema = z.object({
  full_name: z.string().nullable().default(null),
  school: z.string().nullable().default(null),
  field_of_study: z.string().nullable().default(null),
  experiences: z
    .array(z.object({ title: z.string(), org: z.string(), dates: z.string(), summary: z.string() }))
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(z.object({ name: z.string(), summary: z.string() })).default([]),
  languages: z.array(z.string()).default([]),
});

export type CvExtracted = z.infer<typeof CvExtractedSchema> & { raw: string };

export function parseCvExtraction(aiOutput: string, rawText: string): CvExtracted {
  const empty: CvExtracted = {
    full_name: null,
    school: null,
    field_of_study: null,
    experiences: [],
    skills: [],
    projects: [],
    languages: [],
    raw: rawText,
  };
  try {
    const json = extractJsonObject(aiOutput);
    const parsed = CvExtractedSchema.safeParse(json);
    if (parsed.success) return { ...parsed.data, raw: rawText };
  } catch {
    // fall through to empty
  }
  return empty;
}
