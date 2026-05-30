import Stripe from "stripe";
import { readFileSync } from "node:fs";

const ENV_PATH = new URL("../.env", import.meta.url).pathname;
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const key = env.TEST_STRIPE_SECRET_KEY;
if (!key || !key.startsWith("sk_test_")) {
  console.error("TEST_STRIPE_SECRET_KEY missing or not a test key — refusing to run.");
  process.exit(1);
}
const stripe = new Stripe(key);

// €9 / €29 / €59 — the approved good-better-best credit packs.
const PACKS = [
  { key: "decollage", name: "Pass Décollage", credits: 15, amount: 900 },
  { key: "terrain", name: "Pass Terrain", credits: 50, amount: 2900 },
  { key: "reseau", name: "Pass Réseau", credits: 120, amount: 5900 },
];

const out = [];
for (const p of PACKS) {
  // Idempotent: reuse an existing product/price for this pack key if present.
  const found = await stripe.products.search({
    query: `metadata['pack_key']:'${p.key}' AND active:'true'`,
  });
  const product =
    found.data[0] ??
    (await stripe.products.create({
      name: p.name,
      metadata: { pack_key: p.key, credits: String(p.credits) },
    }));

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const price =
    prices.data.find((pr) => pr.unit_amount === p.amount && pr.currency === "eur") ??
    (await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: "eur",
      metadata: { pack_key: p.key, credits: String(p.credits) },
    }));

  out.push(`TEST_STRIPE_PRICE_${p.key.toUpperCase()}=${price.id}`);
}

console.log("\n--- add these to web/.env ---");
console.log(out.join("\n"));
