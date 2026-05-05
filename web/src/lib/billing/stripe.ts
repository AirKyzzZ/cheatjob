import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey && process.env.NODE_ENV !== "production") {
  // Phase 0 ships without real Stripe keys. Don't crash dev imports.
  console.warn("STRIPE_SECRET_KEY not set; stripe client calls will fail until configured.");
}

export const stripe = new Stripe(apiKey ?? "sk_placeholder_phase0", {
  // Pin the API version so behavior is deterministic across Stripe-side
  // upgrades. Bump intentionally.
  apiVersion: "2026-04-22.dahlia",
});
