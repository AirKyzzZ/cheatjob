import Stripe from "stripe";

// Use `||` (not `??`) so an empty-string env var also falls through to the
// placeholder. Vercel and `.env` files surface unset vars as `""`, which is
// not nullish, so `??` would let an empty string reach the SDK constructor
// and trigger "Neither apiKey nor config.authenticator provided" at build
// time when Next collects API route data.
// Dev prefers the test-mode key (so local checkout uses Stripe test cards);
// production (Vercel) only has the live STRIPE_SECRET_KEY set.
const apiKey =
  (process.env.NODE_ENV !== "production" && process.env.TEST_STRIPE_SECRET_KEY) ||
  process.env.STRIPE_SECRET_KEY ||
  "sk_placeholder_phase0";

if (apiKey === "sk_placeholder_phase0" && process.env.NODE_ENV !== "production") {
  console.warn("STRIPE_SECRET_KEY not set; stripe client calls will fail until configured.");
}

export const stripe = new Stripe(apiKey, {
  // Pin the API version so behavior is deterministic across Stripe-side
  // upgrades. Bump intentionally.
  apiVersion: "2026-04-22.dahlia",
});
