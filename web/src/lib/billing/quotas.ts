import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export class QuotaExceededError extends Error {
  readonly upgradeHref = "/dashboard/upgrade";
  constructor() {
    super("Quota exceeded");
    this.name = "QuotaExceededError";
  }
}

export function assertQuotaAvailable(profile: {
  quota_used: number;
  quota_total: number;
}): void {
  if (profile.quota_used >= profile.quota_total) {
    throw new QuotaExceededError();
  }
}

export async function decrementQuota(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_quota", { p_user_id: userId });
  if (error) throw error;
  return data === true;
}
