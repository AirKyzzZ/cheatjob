"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import {
  createCandidature,
  getCandidature,
  updateCandidature,
} from "@/lib/db/candidatures";
import { Step1Schema, Step2Schema, Step4Schema } from "./candidatures.schemas";

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
