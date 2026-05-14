import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesUpdate } from "@/types/database";

export type Profile = Tables<"profiles">;

export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  patch: TablesUpdate<"profiles">
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function markOnboarded(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  await updateProfile(supabase, userId, { onboarded_at: new Date().toISOString() });
}
