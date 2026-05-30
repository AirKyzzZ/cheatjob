export type PackKey = "decollage" | "terrain" | "reseau";

type Pack = { credits: number; priceEnvTest: string; priceEnvLive: string };

// Single source of truth for the credit packs (good-better-best). Credits are
// granted server-side from this config on purchase — never trusted from client
// metadata. Prices live in Stripe; we map a pack key → its price id per env.
export const PACKS: Record<PackKey, Pack> = {
  decollage: { credits: 15, priceEnvTest: "TEST_STRIPE_PRICE_DECOLLAGE", priceEnvLive: "STRIPE_PRICE_DECOLLAGE" },
  terrain: { credits: 50, priceEnvTest: "TEST_STRIPE_PRICE_TERRAIN", priceEnvLive: "STRIPE_PRICE_TERRAIN" },
  reseau: { credits: 120, priceEnvTest: "TEST_STRIPE_PRICE_RESEAU", priceEnvLive: "STRIPE_PRICE_RESEAU" },
};

export function isPackKey(value: string): value is PackKey {
  return value === "decollage" || value === "terrain" || value === "reseau";
}

// Test price id in dev, live price id in prod — mirrors the Stripe key selection.
export function packPriceId(key: PackKey): string {
  const pack = PACKS[key];
  const id =
    (process.env.NODE_ENV !== "production" && process.env[pack.priceEnvTest]) ||
    process.env[pack.priceEnvLive];
  if (!id) throw new Error(`Stripe price id for pack "${key}" is not set`);
  return id;
}

// Whether a pack's Stripe price is configured for this environment — lets the
// UI disable a pack gracefully (rather than a checkout that throws) when the
// live price ids aren't wired yet.
export function hasPackPrice(key: PackKey): boolean {
  const pack = PACKS[key];
  return Boolean(
    (process.env.NODE_ENV !== "production" && process.env[pack.priceEnvTest]) ||
      process.env[pack.priceEnvLive],
  );
}

// Pure: the credit grant (if any) for a completed checkout session. Credits come
// from the server-side PACKS config keyed by metadata.pack — never from the
// client. Returns null when the session can't be mapped to a user + known pack.
export function creditGrantForSession(
  metadata: Record<string, string> | null | undefined,
  clientReferenceId: string | null | undefined,
): { userId: string; credits: number } | null {
  const userId = metadata?.user_id ?? clientReferenceId ?? null;
  const pack = metadata?.pack ?? null;
  if (userId && pack && isPackKey(pack)) {
    return { userId, credits: PACKS[pack].credits };
  }
  return null;
}
