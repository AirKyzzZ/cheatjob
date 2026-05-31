import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { Database } from "@/types/database";
import type { WebhookProcessingResult } from "@/types/billing";
import { getServiceClient } from "@/lib/supabase/admin";
import { markErrored, markProcessed, recordEvent } from "./webhook-events";
import { updateProfile } from "@/lib/db/profiles";
import { creditGrantForSession } from "./packs";

type Client = SupabaseClient<Database>;

/**
 * Process a Stripe webhook event. Currently only `checkout.session.completed`
 * carries business logic (granting pack credits); other event types are
 * recorded and acked. The `client` is injectable for tests.
 */
export async function handleWebhookEvent(
  event: Stripe.Event,
  client: Client = getServiceClient(),
): Promise<WebhookProcessingResult> {
  try {
    const { alreadyProcessed } = await recordEvent(client, event);
    if (alreadyProcessed) return { status: "duplicate", eventId: event.id };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only grant on a settled payment. Async methods (e.g. SEPA) arrive as
      // `completed` with payment_status !== "paid"; ack so Stripe stops
      // retrying — card checkout (our only live method) is "paid" here.
      if (session.payment_status !== "paid") {
        await markProcessed(client, event.id);
        return { status: "ok", eventId: event.id };
      }

      const grant = creditGrantForSession(session.metadata, session.client_reference_id);
      if (grant) {
        // Idempotent per session id: a retry after a partial failure is a no-op
        // in the DB, so credits land exactly once.
        const { error } = await client.rpc("add_credits", {
          p_user_id: grant.userId,
          p_credits: grant.credits,
          p_session_id: session.id,
        });
        if (error) throw error;
        if (typeof session.customer === "string") {
          // Best effort: the grant already committed (idempotently). A failure
          // to persist the customer id (e.g. the unique-constraint clash on a
          // re-created Stripe customer) must not block the ack and trigger an
          // endless retry of an event whose credits already landed.
          try {
            await updateProfile(client, grant.userId, { stripe_customer_id: session.customer });
          } catch (e) {
            console.error(`stripe webhook: failed to persist customer id for ${grant.userId}`, e);
          }
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
