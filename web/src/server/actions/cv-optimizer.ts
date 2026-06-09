"use server";
import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase/admin";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { MODELS } from "@/server/integrations/ai";
import {
  buildCvOptimizerPrompt,
  parseCvAnalysis,
  type CvAnalysis,
} from "@/server/integrations/ai/prompts/cv-optimizer";
import { getServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import {
  assertQuotaAvailable,
  decrementQuota,
  QuotaExceededError,
} from "@/lib/billing/quotas";

type PublicResult =
  | { ok: true; analysis: CvAnalysis }
  | { ok: false; error: "blocked" | "invalid_input" | "rate_limited" | "generation_failed" };

export async function analyzeCvPublic(args: {
  cvText: string;
  offerText: string;
  honeypot?: string;
}): Promise<PublicResult> {
  if (args.honeypot) return { ok: false, error: "blocked" };
  const cv = args.cvText.trim();
  const offer = args.offerText.trim();
  if (cv.length < 200 || cv.length > 8000 || offer.length < 50 || offer.length > 4000) {
    return { ok: false, error: "invalid_input" };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { data: allowed, error: rlErr } = await getServiceClient().rpc("tool_consume", {
    p_ip: ip,
    p_cap: 5,
  });
  if (rlErr || allowed === false) return { ok: false, error: "rate_limited" };
  try {
    const { text } = await getAIProvider().complete(
      MODELS.tool,
      buildCvOptimizerPrompt({ cv, offer, full: false }),
    );
    const analysis = parseCvAnalysis(text);
    if (!analysis) return { ok: false, error: "generation_failed" };
    return { ok: true, analysis };
  } catch {
    return { ok: false, error: "generation_failed" };
  }
}

type FullResult =
  | { ok: true; analysis: CvAnalysis }
  | { ok: false; error: "invalid_input" | "no_cv" | "quota_exceeded" | "generation_failed" };

export async function analyzeCvFull(args: { offerText: string }): Promise<FullResult> {
  const offer = args.offerText.trim();
  if (offer.length < 50 || offer.length > 6000) return { ok: false, error: "invalid_input" };

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const profile = await getProfile(supabase, user.id);
  if (!profile) throw new Error("Profile not found");
  if (!profile.cv_extracted) return { ok: false, error: "no_cv" };

  try {
    assertQuotaAvailable(profile);
  } catch (err) {
    if (err instanceof QuotaExceededError) return { ok: false, error: "quota_exceeded" };
    throw err;
  }

  const cv = [JSON.stringify(profile.cv_extracted), profile.about_me]
    .filter(Boolean)
    .join("\n\nÀ propos: ");
  try {
    const { text } = await getAIProvider().complete(
      MODELS.cvOptimize,
      buildCvOptimizerPrompt({ cv, offer, full: true }),
    );
    const analysis = parseCvAnalysis(text);
    if (!analysis) return { ok: false, error: "generation_failed" };
    // Charge only after a successful parse — a failed generation must never cost a credit.
    await decrementQuota(getServiceClient(), user.id);
    return { ok: true, analysis };
  } catch {
    return { ok: false, error: "generation_failed" };
  }
}
