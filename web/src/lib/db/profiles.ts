import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Locale } from "@/types/locale";

type Client = SupabaseClient<Database>;

export async function getProfile(client: Client, userId: string) {
  return client.from("profiles").select("*").eq("user_id", userId).maybeSingle();
}

export async function createProfile(
  client: Client,
  input: { user_id: string; locale: Locale; full_name?: string },
) {
  return client.from("profiles").insert(input).select().single();
}

export async function updateLocale(client: Client, userId: string, locale: Locale) {
  return client
    .from("profiles")
    .update({ locale })
    .eq("user_id", userId)
    .select()
    .single();
}
