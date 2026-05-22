import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert } from "@/types/database";

export type Message = Tables<"messages">;

export async function insertMessage(
  supabase: SupabaseClient<Database>,
  row: TablesInsert<"messages">,
): Promise<Message> {
  const { data, error } = await supabase.from("messages").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function getLatestMessage(
  supabase: SupabaseClient<Database>,
  candidatureId: string,
): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("candidature_id", candidatureId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
