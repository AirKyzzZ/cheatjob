import { BRAND_COMPANIES } from "@/lib/brand-companies";
import brandLogos from "@/lib/brand-logos.json";
import { ReceiptsTicker } from "./receipts-ticker";

type BrandLogoEntry = { logoUrl: string | null; error?: string; fetchedAt?: string };
const logos = brandLogos as Record<string, BrandLogoEntry | undefined>;

/**
 * Server Component — reads pre-fetched brand logo URLs from
 * `src/lib/brand-logos.json` (populated by `npm run fetch:brand-logos`).
 * No Brandfetch API calls at runtime: the JSON is committed, deterministic,
 * and immune to quota issues. Refresh by re-running the script.
 */
export function Receipts() {
  const enriched = BRAND_COMPANIES.map((c) => ({
    ...c,
    logoUrl: logos[c.domain]?.logoUrl ?? null,
  }));
  return <ReceiptsTicker companies={enriched} />;
}
