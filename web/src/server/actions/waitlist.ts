"use server";

import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { addWaitlistEntry } from "@/lib/db/waitlist-entries";

const Schema = z.object({
  email: z.string().email().max(255),
  plan: z.enum(["sprint", "mois", "vie"]).optional(),
  source: z.string().max(100).optional(),
  intent: z.string().max(100).optional(),
  locale: z.enum(["fr", "en", "es", "de"]),
});

export async function joinWaitlist(input: unknown) {
  const parsed = Schema.parse(input);
  const supabase = await getServerClient();

  const { error } = await addWaitlistEntry(supabase, {
    email: parsed.email,
    plan: parsed.plan ?? null,
    source: parsed.source,
    utm: parsed.intent ? { intent: parsed.intent } : undefined,
    locale: parsed.locale,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true as const };
}
