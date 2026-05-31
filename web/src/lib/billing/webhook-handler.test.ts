import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";
import { handleWebhookEvent } from "./webhook-handler";

type Responses = {
  insertError?: { code?: string; message?: string } | null;
  selectRow?: { processed_at: string | null } | null;
  selectError?: { message: string } | null;
  rpcError?: { message: string } | null;
  updateError?: { message: string } | null;
  profilesUpdateError?: { message: string } | null;
};

function makeClient(r: Responses) {
  const calls = {
    rpc: [] as { name: string; args: unknown }[],
    updates: [] as { table: string; patch: Record<string, unknown> }[],
  };
  const client = {
    from(table: string) {
      return {
        insert: async () => ({ error: r.insertError ?? null }),
        update: (patch: Record<string, unknown>) => {
          calls.updates.push({ table, patch });
          const error = table === "profiles" ? (r.profilesUpdateError ?? null) : (r.updateError ?? null);
          return { eq: async () => ({ error }) };
        },
        select: () => ({
          eq: () => ({
            single: async () => ({ data: r.selectRow ?? null, error: r.selectError ?? null }),
          }),
        }),
      };
    },
    rpc: async (name: string, args: unknown) => {
      calls.rpc.push({ name, args });
      return { error: r.rpcError ?? null };
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: client as any, calls };
}

function checkoutEvent(opts: {
  id?: string;
  sessionId?: string;
  paymentStatus?: string;
  metadata?: Record<string, string> | null;
  customer?: string | null;
} = {}): Stripe.Event {
  return {
    id: opts.id ?? "evt_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: opts.sessionId ?? "cs_1",
        payment_status: opts.paymentStatus ?? "paid",
        metadata: opts.metadata ?? { user_id: "u1", pack: "terrain" },
        client_reference_id: null,
        customer: opts.customer ?? null,
      },
    },
  } as unknown as Stripe.Event;
}

const processedUpdate = (u: { table: string; patch: Record<string, unknown> }) =>
  u.table === "billing_events" && Boolean(u.patch.processed_at);

describe("handleWebhookEvent", () => {
  it("grants credits once for a new paid checkout session, keyed by session id", async () => {
    const { client, calls } = makeClient({ insertError: null });
    const res = await handleWebhookEvent(checkoutEvent({ sessionId: "cs_abc", customer: "cus_1" }), client);

    expect(res).toEqual({ status: "ok", eventId: "evt_1" });
    expect(calls.rpc).toEqual([
      { name: "add_credits", args: { p_user_id: "u1", p_credits: 50, p_session_id: "cs_abc" } },
    ]);
    expect(calls.updates.some(processedUpdate)).toBe(true);
  });

  it("re-attempts the grant when the event was recorded but never processed (H1)", async () => {
    const { client, calls } = makeClient({
      insertError: { code: "23505" },
      selectRow: { processed_at: null },
    });
    const res = await handleWebhookEvent(checkoutEvent({ sessionId: "cs_retry" }), client);

    expect(res).toEqual({ status: "ok", eventId: "evt_1" });
    expect(calls.rpc).toEqual([
      { name: "add_credits", args: { p_user_id: "u1", p_credits: 50, p_session_id: "cs_retry" } },
    ]);
  });

  it("treats a fully-processed event as a duplicate without granting again", async () => {
    const { client, calls } = makeClient({
      insertError: { code: "23505" },
      selectRow: { processed_at: "2026-05-31T00:00:00Z" },
    });
    const res = await handleWebhookEvent(checkoutEvent(), client);

    expect(res).toEqual({ status: "duplicate", eventId: "evt_1" });
    expect(calls.rpc).toEqual([]);
  });

  it("does not grant for an unpaid session but acks it so Stripe stops retrying (H2)", async () => {
    const { client, calls } = makeClient({ insertError: null });
    const res = await handleWebhookEvent(checkoutEvent({ paymentStatus: "unpaid" }), client);

    expect(res).toEqual({ status: "ok", eventId: "evt_1" });
    expect(calls.rpc).toEqual([]);
    expect(calls.updates.some(processedUpdate)).toBe(true);
  });

  it("acks the event even if persisting the Stripe customer id fails after a successful grant", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, calls } = makeClient({
      insertError: null,
      profilesUpdateError: { message: "duplicate key value violates unique constraint" },
    });
    const res = await handleWebhookEvent(checkoutEvent({ customer: "cus_dupe" }), client);

    expect(res).toEqual({ status: "ok", eventId: "evt_1" });
    expect(calls.rpc).toHaveLength(1);
    expect(calls.updates.some(processedUpdate)).toBe(true);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("returns error and does not mark processed when the grant fails (so the retry re-runs it)", async () => {
    const { client, calls } = makeClient({ insertError: null, rpcError: { message: "db down" } });
    const res = await handleWebhookEvent(checkoutEvent(), client);

    expect(res.status).toBe("error");
    expect(calls.updates.some(processedUpdate)).toBe(false);
    expect(calls.updates.some((u) => u.table === "billing_events" && "processing_error" in u.patch)).toBe(true);
  });
});
