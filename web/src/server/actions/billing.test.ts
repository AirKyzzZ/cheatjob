import { describe, it, expect, vi, beforeEach } from "vitest";

const { sessionsCreate } = vi.hoisted(() => ({ sessionsCreate: vi.fn() }));

vi.mock("@/lib/billing/stripe", () => ({
  stripe: { checkout: { sessions: { create: sessionsCreate } } },
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1", email: "u@x.com" } } }) },
  }),
}));

import { createCheckout } from "./billing";

beforeEach(() => {
  sessionsCreate.mockReset();
  sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/cs_1" });
  process.env.TEST_STRIPE_PRICE_TERRAIN = "price_test_terrain";
});

describe("createCheckout", () => {
  it("rejects an unknown pack before creating a Stripe session", async () => {
    await expect(createCheckout("bogus", "fr")).rejects.toThrow(/Unknown pack/);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects a tampered locale before creating a Stripe session (M1)", async () => {
    await expect(createCheckout("terrain", "../evil")).rejects.toThrow(/locale/i);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("builds localized return URLs for a valid pack + locale", async () => {
    const { url } = await createCheckout("terrain", "fr");
    expect(url).toBe("https://checkout.stripe.test/cs_1");
    expect(sessionsCreate).toHaveBeenCalledOnce();
    const arg = sessionsCreate.mock.calls[0][0] as {
      success_url: string;
      cancel_url: string;
      metadata: Record<string, string>;
      client_reference_id: string;
    };
    expect(arg.success_url).toContain("/fr/dashboard?upgrade=success&pack=terrain");
    expect(arg.cancel_url).toContain("/fr/dashboard/upgrade");
    expect(arg.metadata).toEqual({ user_id: "u1", pack: "terrain" });
    expect(arg.client_reference_id).toBe("u1");
  });

  it("restricts checkout to card so the webhook's paid-on-completion assumption holds", async () => {
    await createCheckout("terrain", "fr");
    const arg = sessionsCreate.mock.calls[0][0] as { payment_method_types: string[] };
    expect(arg.payment_method_types).toEqual(["card"]);
  });
});
