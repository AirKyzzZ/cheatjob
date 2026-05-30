import type Stripe from "stripe";
import type { WebhookProcessingResult } from "@/types/billing";
import { getServiceClient } from "@/lib/supabase/admin";
import { markErrored, markProcessed, recordEvent } from "./webhook-events";
import { updateProfile } from "@/lib/db/profiles";
import { creditGrantForSession } from "./packs";

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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const grant = creditGrantForSession(session.metadata, session.client_reference_id);
      if (grant) {
        const { error } = await client.rpc("add_credits", {
          p_user_id: grant.userId,
          p_credits: grant.credits,
        });
        if (error) throw error;
        if (typeof session.customer === "string") {
          await updateProfile(client, grant.userId, { stripe_customer_id: session.customer });
        }
      }
    }

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
