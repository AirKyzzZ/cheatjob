import type Stripe from "stripe";
import type { WebhookProcessingResult } from "@/types/billing";
import { getServiceClient } from "@/lib/supabase/admin";
import { markErrored, markProcessed, recordEvent } from "./webhook-events";

/**
 * Process a Stripe webhook event. Phase 0 only records events; per-event
 * business logic (subscription created, invoice paid, etc.) is added in
 * Phase 4 when real plans exist.
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<WebhookProcessingResult> {
  const client = getServiceClient();

  try {
    const { duplicate } = await recordEvent(client, event);
    if (duplicate) return { status: "duplicate", eventId: event.id };

    // Phase 4 dispatch table goes here.
    await markProcessed(client, event.id);
    return { status: "ok", eventId: event.id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    try {
      await markErrored(client, event.id, reason);
    } catch {
      // Best effort. If even the error-write fails (e.g., DB down), we
      // still want to return a structured error to Stripe so it retries.
    }
    return { status: "error", eventId: event.id, reason };
  }
}
