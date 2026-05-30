"use server";

import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/db/profiles";
import { getCandidature, updateCandidature } from "@/lib/db/candidatures";
import { insertMessage } from "@/lib/db/messages";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { type AIProvider, MODELS, AIGenerationError } from "@/server/integrations/ai";
import { extractJsonObject } from "@/server/integrations/ai/json";
import { buildDraftPrompt, DRAFT_PROMPT_VERSION } from "@/server/integrations/ai/prompts/draft-initial";

type DraftResult =
  | { ok: true; subject: string; body: string }
  | { ok: false; error: "generation_failed" };

export async function generateMessage(candidatureId: string): Promise<DraftResult> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const candidature = await getCandidature(supabase, candidatureId);
  if (!candidature || candidature.user_id !== user.id) {
    throw new Error("Candidature not found");
  }

  const profile = await getProfile(supabase, user.id);
  if (!profile) throw new Error("Profile not found");

  const messages = buildDraftPrompt({
    profile: {
      full_name: profile.full_name,
      school: profile.school,
      study_level: profile.study_level,
      about_me: profile.about_me,
    },
    cvExtracted: profile.cv_extracted,
    candidature: {
      company_name: candidature.company_name,
      target_role: candidature.target_role,
      manager_first_name: candidature.manager_first_name,
      manager_role: candidature.manager_role,
      offer_text: candidature.offer_text,
    },
  });

  let completion: Awaited<ReturnType<AIProvider["complete"]>>;
  try {
    completion = await getAIProvider().complete(MODELS.draft, messages);
  } catch (err) {
    if (err instanceof AIGenerationError) return { ok: false, error: "generation_failed" };
    throw err;
  }

  let subject: string;
  let body: string;
  try {
    const parsed = z
      .object({ subject: z.string().min(1), body: z.string().min(1) })
      .safeParse(extractJsonObject(completion.text));
    if (!parsed.success) throw new Error("invalid draft shape");
    subject = parsed.data.subject;
    body = parsed.data.body;
  } catch {
    return { ok: false, error: "generation_failed" };
  }

  const service = getServiceClient();
  await insertMessage(service, {
    candidature_id: candidatureId,
    user_id: user.id,
    type: "initial",
    subject,
    body,
    generated_by_model: completion.model,
    prompt_version: DRAFT_PROMPT_VERSION,
    generation_cost_usd: completion.costUsd,
  });

  await updateCandidature(supabase, candidatureId, {
    status: "ready",
    wizard_step: 5,
  });

  return { ok: true, subject, body };
}
