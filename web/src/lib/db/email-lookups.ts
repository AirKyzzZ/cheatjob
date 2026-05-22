import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/types/database";

export async function insertEmailLookup(
  supabase: SupabaseClient<Database>,
  row: TablesInsert<"email_lookups">,
): Promise<void> {
  const { error } = await supabase.from("email_lookups").insert(row);
  if (error) throw error;
}
