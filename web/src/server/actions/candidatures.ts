"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import {
  createCandidature,
  getCandidature,
  updateCandidature,
} from "@/lib/db/candidatures";
import { Step1Schema, Step2Schema, Step4Schema, ManualEmailSchema, SetStatusSchema, SaveDraftEditSchema } from "./candidatures.schemas";
import { getLatestMessage, insertMessage } from "@/lib/db/messages";
import { getServiceClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/db/profiles";
import { insertEmailLookup } from "@/lib/db/email-lookups";
import { assertQuotaAvailable, decrementQuota, QuotaExceededError } from "@/lib/billing/quotas";
import { getEmailFinder } from "@/server/integrations/email-finder/findymail";
import { EmailFinderUnavailableError } from "@/server/integrations/email-finder";
import type { Json, TablesUpdate } from "@/types/database";

async function requireUser() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

function deriveDomain(website?: string): string | null {
  if (!website) return null;
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function requireOwnedCandidature(id: string) {
  const { supabase, user } = await requireUser();
  const candidature = await getCandidature(supabase, id);
  if (!candidature || candidature.user_id !== user.id) {
    throw new Error("Candidature not found");
  }
  return { supabase, user, candidature };
}

export async function createDraft(input: unknown) {
  const parsed = Step1Schema.parse(input);
  const { supabase, user } = await requireUser();

  const candidature = await createCandidature(supabase, {
    user_id: user.id,
    company_name: parsed.companyName,
    company_website: parsed.companyWebsite || null,
    company_domain: deriveDomain(parsed.companyWebsite || undefined),
    status: "draft",
    wizard_step: 1,
  });

  return { id: candidature.id };
}

export async function upsertStep1(id: string, input: unknown) {
  const parsed = Step1Schema.parse(input);
  const { supabase } = await requireOwnedCandidature(id);
  await updateCandidature(supabase, id, {
    company_name: parsed.companyName,
    company_website: parsed.companyWebsite || null,
    company_domain: deriveDomain(parsed.companyWebsite || undefined),
  });
  return { ok: true as const };
}

export async function upsertStep2(id: string, input: unknown) {
  const parsed = Step2Schema.parse(input);
  const { supabase, candidature } = await requireOwnedCandidature(id);
  await updateCandidature(supabase, id, {
    manager_first_name: parsed.managerFirstName,
    manager_last_name: parsed.managerLastName,
    manager_role: parsed.managerRole,
    manager_linkedin_url: parsed.managerLinkedinUrl || null,
    target_role: parsed.targetRole || null,
    wizard_step: Math.max(candidature.wizard_step, 2),
  });
  return { ok: true as const };
}

export async function upsertStep4(id: string, input: unknown) {
  const parsed = Step4Schema.parse(input);
  const { supabase, candidature } = await requireOwnedCandidature(id);
  await updateCandidature(supabase, id, {
    offer_url: parsed.offerUrl || null,
    offer_text: parsed.offerText || null,
    wizard_step: Math.max(candidature.wizard_step, 4),
  });
  return { ok: true as const };
}

export async function findEmail(id: string) {
  const { supabase, user, candidature } = await requireOwnedCandidature(id);

  if (candidature.manager_email) {
    return {
      status: "found" as const,
      email: candidature.manager_email,
      confidence: candidature.manager_email_confidence ?? "manual",
    };
  }

  const profile = await getProfile(supabase, user.id);
  if (!profile) throw new Error("Profile not found");
  try {
    assertQuotaAvailable(profile);
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return { status: "quota_exceeded" as const };
    }
    throw err;
  }

  if (!candidature.manager_first_name || !candidature.manager_last_name) {
    throw new Error("Manager name is required before lookup");
  }
  const domain = candidature.company_domain;
  if (!domain) throw new Error("Company domain is required before lookup");

  const finder = getEmailFinder();
  const service = getServiceClient();

  let result;
  try {
    result = await finder.findEmail({
      firstName: candidature.manager_first_name,
      lastName: candidature.manager_last_name,
      domain,
    });
  } catch (err) {
    if (err instanceof EmailFinderUnavailableError) {
      await insertEmailLookup(service, {
        user_id: user.id,
        candidature_id: id,
        query: { first_name: candidature.manager_first_name, last_name: candidature.manager_last_name, domain } as Json,
        provider: finder.provider,
        cost_usd: 0,
        raw_response: { error: "unavailable" },
      });
      return { status: "unavailable" as const };
    }
    throw err;
  }

  await insertEmailLookup(service, {
    user_id: user.id,
    candidature_id: id,
    query: { first_name: candidature.manager_first_name, last_name: candidature.manager_last_name, domain } as Json,
    result_email: result.found ? result.email : null,
    confidence: result.found ? result.confidence : "not_found",
    provider: finder.provider,
    cost_usd: result.costUsd,
    raw_response: result.raw as Json,
  });

  if (!result.found) {
    return { status: "not_found" as const };
  }

  await updateCandidature(supabase, id, {
    manager_email: result.email,
    manager_email_confidence: result.confidence,
    manager_email_provider: "findymail",
    wizard_step: Math.max(candidature.wizard_step, 3),
  });

  const consumed = await decrementQuota(service, user.id);
  if (!consumed) {
    console.warn(`quota decrement no-op for user ${user.id} on candidature ${id}`);
  }

  return { status: "found" as const, email: result.email, confidence: result.confidence };
}

export async function saveManualEmail(id: string, input: unknown) {
  const parsed = ManualEmailSchema.parse(input);
  const { supabase, user, candidature } = await requireOwnedCandidature(id);

  const profile = await getProfile(supabase, user.id);
  if (!profile) throw new Error("Profile not found");
  try {
    assertQuotaAvailable(profile);
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return { ok: false as const, error: "quota_exceeded" as const };
    }
    throw err;
  }

  await updateCandidature(supabase, id, {
    manager_email: parsed.email,
    manager_email_confidence: "manual",
    manager_email_provider: "manual",
    wizard_step: Math.max(candidature.wizard_step, 3),
  });

  const service = getServiceClient();
  const consumed = await decrementQuota(service, user.id);
  if (!consumed) console.warn(`quota decrement no-op (manual) for user ${user.id}`);

  return { ok: true as const };
}

// `revalidatePath` invalidates the server-rendered cache so the *next* visit
// (or a parallel tab) sees fresh data; the calling client component also calls
// `router.refresh()` to update the current view immediately. Different jobs.
export async function markSent(id: string) {
  const { supabase, candidature } = await requireOwnedCandidature(id);
  if (candidature.status !== "ready") {
    throw new Error("Candidature is not ready to send");
  }
  await updateCandidature(supabase, id, {
    status: "sent",
    sent_at: new Date().toISOString(),
  });
  // Phase 1c: insert a scheduled_emails follow-up row here.
  revalidatePath(`/[locale]/dashboard`, "page");
  revalidatePath(`/[locale]/dashboard/candidatures/[id]`, "page");
  return { ok: true as const };
}

export async function setCandidatureStatus(input: unknown) {
  const parsed = SetStatusSchema.parse(input);
  const { supabase } = await requireOwnedCandidature(parsed.id);
  const now = new Date().toISOString();
  const patch: TablesUpdate<"candidatures"> = { status: parsed.status };
  if (parsed.status === "replied") {
    patch.replied_at = now;
  } else if (parsed.status === "closed") {
    patch.closed_at = now;
    patch.closed_reason = parsed.closedReason ?? "other";
  }
  await updateCandidature(supabase, parsed.id, patch);
  revalidatePath(`/[locale]/dashboard`, "page");
  revalidatePath(`/[locale]/dashboard/candidatures/[id]`, "page");
  return { ok: true as const };
}

// Edits are stored as a NEW `messages` row (append-only). `getLatestMessage`
// orders by created_at desc so the UI always reflects the latest edit; the
// older rows preserve the generation history for prompt-quality analysis.
export async function saveDraftEdit(input: unknown) {
  const parsed = SaveDraftEditSchema.parse(input);
  const { supabase, user } = await requireOwnedCandidature(parsed.candidatureId);
  const latest = await getLatestMessage(supabase, parsed.candidatureId);
  if (!latest) throw new Error("No draft to edit");

  const service = getServiceClient();
  await insertMessage(service, {
    candidature_id: parsed.candidatureId,
    user_id: user.id,
    type: "initial",
    subject: parsed.subject,
    body: parsed.body,
    generated_by_model: latest.generated_by_model,
    prompt_version: latest.prompt_version,
    edited_by_user: true,
    user_edited_body: parsed.body,
  });
  revalidatePath(`/[locale]/dashboard/candidatures/[id]`, "page");
  return { ok: true as const };
}
