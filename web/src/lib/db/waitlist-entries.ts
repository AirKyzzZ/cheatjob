import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Locale } from "@/types/locale";

type Client = SupabaseClient<Database>;

export type WaitlistEntryInput = {
  email: string;
  plan?: "sprint" | "mois" | "vie" | null;
  source?: string;
  utm?: Record<string, unknown>;
  locale: Locale;
};

export async function addWaitlistEntry(client: Client, input: WaitlistEntryInput) {
  return client
    .from("waitlist_entries")
    .insert({
      email: input.email,
      plan: input.plan ?? null,
      source: input.source ?? null,
      utm: (input.utm ?? null) as Database["public"]["Tables"]["waitlist_entries"]["Insert"]["utm"],
      locale: input.locale,
    })
    .select()
    .single();
}
