import Stripe from "stripe";

// Use `||` (not `??`) so an empty-string env var also falls through to the
// placeholder. Vercel and `.env` files surface unset vars as `""`, which is
// not nullish, so `??` would let an empty string reach the SDK constructor
// and trigger "Neither apiKey nor config.authenticator provided" at build
// time when Next collects API route data.
const apiKey = process.env.STRIPE_SECRET_KEY || "sk_placeholder_phase0";

if (apiKey === "sk_placeholder_phase0" && process.env.NODE_ENV !== "production") {
  console.warn("STRIPE_SECRET_KEY not set; stripe client calls will fail until configured.");
}

export const stripe = new Stripe(apiKey, {
  // Pin the API version so behavior is deterministic across Stripe-side
  // upgrades. Bump intentionally.
  apiVersion: "2026-04-22.dahlia",
});
