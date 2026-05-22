import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Candidature = Tables<"candidatures">;

export async function createCandidature(
  supabase: SupabaseClient<Database>,
  row: TablesInsert<"candidatures">,
): Promise<Candidature> {
  const { data, error } = await supabase.from("candidatures").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function getCandidature(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<Candidature | null> {
  const { data, error } = await supabase
    .from("candidatures")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateCandidature(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: TablesUpdate<"candidatures">,
): Promise<Candidature> {
  const { data, error } = await supabase
    .from("candidatures")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listCandidatures(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Candidature[]> {
  const { data, error } = await supabase
    .from("candidatures")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
