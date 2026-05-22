"use server";

import { PDFParse } from "pdf-parse";
import { getServerClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/db/profiles";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { MODELS } from "@/server/integrations/ai";
import { buildCvExtractPrompt } from "@/server/integrations/ai/prompts/cv-extract";
import { parseCvExtraction } from "@/lib/db/cv-extracted.schema";
import { CVParseError } from "./cv-parser.errors";

export async function parseCV(storagePath: string): Promise<{ ok: true }> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (!storagePath.startsWith(`${user.id}/`)) {
    throw new Error("Storage path does not match user id");
  }

  const { data: file, error } = await supabase.storage.from("cv-files").download(storagePath);
  if (error || !file) throw new CVParseError();

  let rawText: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    rawText = result.text.trim();
    if (!rawText) throw new Error("empty");
  } catch {
    throw new CVParseError();
  }

  let aiOutput = "";
  try {
    const completion = await getAIProvider().complete(
      MODELS.cvExtract,
      buildCvExtractPrompt(rawText),
    );
    aiOutput = completion.text;
  } catch {
    // AI failed — degrade to raw-only extraction.
  }

  const cvExtracted = parseCvExtraction(aiOutput, rawText);
  await updateProfile(supabase, user.id, { cv_extracted: cvExtracted });

  return { ok: true };
}
