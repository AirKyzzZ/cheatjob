"use server";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/db/profiles";
import {
  assertQuotaAvailable,
  decrementQuota,
  QuotaExceededError,
} from "@/lib/billing/quotas";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { MODELS } from "@/server/integrations/ai";
import { extractJsonObject } from "@/server/integrations/ai/json";
import { buildLettrePrompt } from "@/server/integrations/ai/prompts/lettre-full";

type LettreResult =
  | { ok: true; subject: string; body: string }
  | { ok: false; error: "invalid_input" | "quota_exceeded" | "generation_failed" };

const LettreOutputSchema = z.object({ subject: z.string().min(1), body: z.string().min(1) });

export async function writeLettre(args: {
  targetRole: string;
  targetCompany: string;
  recruiterName?: string;
  offerContext: string;
}): Promise<LettreResult> {
  const targetRole = args.targetRole.trim();
  const targetCompany = args.targetCompany.trim();
  const offerContext = args.offerContext.trim();
  if (!targetRole || !targetCompany || offerContext.length < 50 || offerContext.length > 6000) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const profile = await getProfile(supabase, user.id);
  if (!profile) throw new Error("Profile not found");

  try {
    assertQuotaAvailable(profile);
  } catch (err) {
    if (err instanceof QuotaExceededError) return { ok: false, error: "quota_exceeded" };
    throw err;
  }

  let parsed: z.infer<typeof LettreOutputSchema> | null;
  try {
    const { text } = await getAIProvider().complete(
      MODELS.lettre,
      buildLettrePrompt({
        profile: {
          full_name: profile.full_name,
          school: profile.school,
          about_me: profile.about_me,
        },
        cvExtracted: profile.cv_extracted,
        lettre: { targetRole, targetCompany, recruiterName: args.recruiterName, offerContext },
      }),
    );
    const result = LettreOutputSchema.safeParse(extractJsonObject(text));
    parsed = result.success ? result.data : null;
  } catch {
    return { ok: false, error: "generation_failed" };
  }
  if (!parsed) return { ok: false, error: "generation_failed" };
  // Charge only after a successful parse — a failed generation must never cost a credit.
  // consume_quota is atomic: false means a concurrent call won the last credit.
  const consumed = await decrementQuota(getServiceClient(), user.id);
  if (!consumed) return { ok: false, error: "quota_exceeded" };
  return { ok: true, subject: parsed.subject, body: parsed.body };
}
