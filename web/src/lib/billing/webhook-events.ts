import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/**
 * Records the event in billing_events and reports whether it has ALREADY been
 * fully processed. We dedup on `processed_at`, not row existence: an event that
 * was recorded but whose grant never completed (it threw, or the process
 * crashed) must re-run on Stripe's retry rather than be swallowed as a
 * duplicate — otherwise a paid user could end up with zero credits.
 */
export async function recordEvent(
  client: Client,
  event: Stripe.Event,
): Promise<{ alreadyProcessed: boolean }> {
  const { error } = await client.from("billing_events").insert({
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    raw_event: event as unknown as Database["public"]["Tables"]["billing_events"]["Insert"]["raw_event"],
  });

  if (!error) return { alreadyProcessed: false };
  // 23505 = unique violation: already recorded. Re-check whether it finished.
  if (error.code === "23505") {
    const { data, error: selectError } = await client
      .from("billing_events")
      .select("processed_at")
      .eq("stripe_event_id", event.id)
      .single();
    if (selectError) throw new Error(`recordEvent re-check failed: ${selectError.message}`);
    return { alreadyProcessed: data?.processed_at != null };
  }
  throw new Error(`recordEvent failed: ${error.message}`);
}

export async function markProcessed(client: Client, eventId: string) {
  const { error } = await client
    .from("billing_events")
    .update({ processed_at: new Date().toISOString(), processing_error: null })
    .eq("stripe_event_id", eventId);
  if (error) throw new Error(`markProcessed failed: ${error.message}`);
}

export async function markErrored(client: Client, eventId: string, reason: string) {
  const { error } = await client
    .from("billing_events")
    .update({ processing_error: reason })
    .eq("stripe_event_id", eventId);
  if (error) throw new Error(`markErrored failed: ${error.message}`);
}
