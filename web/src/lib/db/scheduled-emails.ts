import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert } from "@/types/database";

export type ScheduledEmail = Tables<"scheduled_emails">;

const FOLLOW_UP_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

export function followUpDueDate(from: Date): string {
  return new Date(from.getTime() + FOLLOW_UP_DELAY_MS).toISOString();
}

// Idempotent: the partial unique index (candidature_id, kind) WHERE status='pending'
// makes a second pending follow-up a 23505 conflict, which we treat as a no-op.
export async function enqueueFollowUp(
  service: SupabaseClient<Database>,
  input: { userId: string; candidatureId: string; sendAfter: string },
): Promise<{ enqueued: boolean }> {
  const row: TablesInsert<"scheduled_emails"> = {
    user_id: input.userId,
    candidature_id: input.candidatureId,
    kind: "follow_up",
    send_after: input.sendAfter,
    status: "pending",
  };
  const { error } = await service.from("scheduled_emails").insert(row);
  if (error) {
    if (error.code === "23505") return { enqueued: false };
    throw error;
  }
  return { enqueued: true };
}

// Atomic claim: flip due rows to 'processing' and return only the rows this call
// won. Also reclaims rows stuck in 'processing' (e.g. a crashed run); reprocessing
// is delivery-safe because each send carries a stable Resend idempotency key.
export async function claimDueFollowUps(
  service: SupabaseClient<Database>,
  nowIso: string,
): Promise<ScheduledEmail[]> {
  const { data, error } = await service
    .from("scheduled_emails")
    .update({ status: "processing" })
    .lte("send_after", nowIso)
    .in("status", ["pending", "processing"])
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function markScheduledEmailSent(
  service: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await service
    .from("scheduled_emails")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function markScheduledEmailCancelled(
  service: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await service
    .from("scheduled_emails")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

const MAX_ATTEMPTS = 3;

// Retryable failure: bump attempts and drop back to 'pending' so the next run
// retries, until MAX_ATTEMPTS is reached, then mark terminally 'failed'.
export async function markScheduledEmailFailed(
  service: SupabaseClient<Database>,
  id: string,
  message: string,
  attempts: number,
): Promise<void> {
  const nextAttempts = attempts + 1;
  const status = nextAttempts >= MAX_ATTEMPTS ? "failed" : "pending";
  const { error } = await service
    .from("scheduled_emails")
    .update({ status, last_error: message.slice(0, 500), attempts: nextAttempts })
    .eq("id", id);
  if (error) throw error;
}
