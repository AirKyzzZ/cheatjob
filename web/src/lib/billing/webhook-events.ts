import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/**
 * Inserts the event into billing_events. Returns whether the row was new
 * or a duplicate (Stripe retries until 2xx).
 */
export async function recordEvent(
  client: Client,
  event: Stripe.Event,
): Promise<{ duplicate: boolean }> {
  const { error } = await client.from("billing_events").insert({
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    raw_event: event as unknown as Database["public"]["Tables"]["billing_events"]["Insert"]["raw_event"],
  });

  if (!error) return { duplicate: false };
  // 23505 = unique violation on stripe_event_id
  if (error.code === "23505") return { duplicate: true };
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
