#!/usr/bin/env node
/**
 * Fetches Brandfetch logo URLs for every brand in `src/lib/brand-companies.ts`
 * and writes them to `src/lib/brand-logos.json`. Run this once per Brandfetch
 * billing cycle (or when you add/edit a brand) — the JSON is committed and
 * read by `<Receipts>` at runtime so the live site never hits Brandfetch.
 *
 * Usage:
 *   npm --prefix web run fetch:brand-logos          # fetch only missing/retry-able
 *   npm --prefix web run fetch:brand-logos -- --force  # re-fetch every brand
 *
 * Reads BRANDFETCH_API_KEY from web/.env.local.
 *
 * Skip policy: brands with a `logoUrl` set OR with `error: "not_found"` are
 * left alone. `error: "rate_limited" | "fetch_error"` are retried on next run.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COMPANIES_PATH = join(ROOT, "src/lib/brand-companies.ts");
const LOGOS_PATH = join(ROOT, "src/lib/brand-logos.json");
const ENV_PATH = join(ROOT, ".env.local");

const API = "https://api.brandfetch.io/v2";
const FORMAT_ORDER = ["svg", "png", "webp", "jpeg"];

const FORCE = process.argv.includes("--force");

function loadEnvKey() {
  try {
    const raw = readFileSync(ENV_PATH, "utf8");
    const match = raw.match(/^BRANDFETCH_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, "");
  } catch {
    // fall through to process.env
  }
  return process.env.BRANDFETCH_API_KEY;
}

function loadCompanies() {
  const raw = readFileSync(COMPANIES_PATH, "utf8");
  const entries = [...raw.matchAll(/\{\s*name:\s*"([^"]+)",\s*domain:\s*"([^"]+)"\s*\}/g)];
  return entries.map((m) => ({ name: m[1], domain: m[2] }));
}

function loadExisting() {
  try {
    return JSON.parse(readFileSync(LOGOS_PATH, "utf8"));
  } catch {
    return {};
  }
}

function pickBestLogoUrl(data) {
  const logos = data?.logos ?? [];
  if (!logos.length) return null;
  const pick = (type) => {
    const candidates = logos.filter((l) => l.type === type);
    return candidates.find((l) => l.theme === "dark") ?? candidates[0];
  };
  const variant = pick("logo") ?? pick("icon") ?? pick("symbol") ?? logos[0];
  if (!variant?.formats?.length) return null;
  for (const fmt of FORMAT_ORDER) {
    const match = variant.formats.find((f) => f.format === fmt);
    if (match) return match.src;
  }
  return variant.formats[0]?.src ?? null;
}

async function fetchOne(domain, key) {
  let res;
  try {
    res = await fetch(`${API}/brands/${encodeURIComponent(domain)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch (e) {
    return { error: "fetch_error", message: String(e) };
  }
  if (res.status === 429) return { error: "rate_limited" };
  if (res.status === 404) return { error: "not_found" };
  if (!res.ok) return { error: "fetch_error", message: `HTTP ${res.status}` };
  const json = await res.json();
  const url = pickBestLogoUrl(json);
  if (!url) return { error: "not_found" };
  return { logoUrl: url };
}

function shouldSkip(entry) {
  if (FORCE) return false;
  if (!entry) return false;
  if (entry.logoUrl) return true;
  if (entry.error === "not_found") return true;
  return false;
}

async function main() {
  const key = loadEnvKey();
  if (!key) {
    console.error("BRANDFETCH_API_KEY missing (looked in web/.env.local and env).");
    process.exit(1);
  }
  const companies = loadCompanies();
  const existing = loadExisting();
  const next = { ...existing };
  const now = new Date().toISOString();

  let fetched = 0;
  let skipped = 0;
  let rateLimited = 0;

  for (const { name, domain } of companies) {
    if (shouldSkip(next[domain])) {
      skipped++;
      continue;
    }
    process.stdout.write(`  ${name.padEnd(16)} ${domain.padEnd(22)} `);
    const result = await fetchOne(domain, key);
    if (result.logoUrl) {
      next[domain] = { logoUrl: result.logoUrl, fetchedAt: now };
      fetched++;
      console.log("OK");
    } else {
      next[domain] = { logoUrl: null, error: result.error, fetchedAt: now };
      if (result.error === "rate_limited") rateLimited++;
      console.log(result.error + (result.message ? ` (${result.message})` : ""));
    }
  }

  writeFileSync(LOGOS_PATH, JSON.stringify(next, null, 2) + "\n");
  console.log(
    `\n${fetched} fetched, ${skipped} skipped (already had logos), ${rateLimited} rate-limited.`
  );
  if (rateLimited > 0) {
    console.log("Re-run after the Brandfetch monthly quota resets to fill these.");
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
