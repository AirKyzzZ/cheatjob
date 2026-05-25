import { BRAND_COMPANIES } from "@/lib/brand-companies";
import { ReceiptsTicker } from "./receipts-ticker";

/**
 * Server Component — composes each brand's Brandfetch Logo Link URL.
 * The clientId is public (it ships in every <img> src that hits Brandfetch's
 * CDN); per Brandfetch's docs the Logo API is designed for direct browser
 * embedding, so we ship the URL and let the user's browser fetch the image —
 * no server-side calls, no API quota, no JSON cache to maintain.
 *
 * Theme `dark` = dark-colored asset for our cream background. Defaults to
 * `webp`, full-color horizontal wordmark.
 */
export function Receipts() {
  const clientId = process.env.BRANDFETCH_CLIENT_ID;
  const enriched = BRAND_COMPANIES.map((c) => ({
    ...c,
    logoUrl: clientId
      ? `https://cdn.brandfetch.io/${c.domain}/theme/dark/logo?c=${clientId}`
      : null,
  }));
  return <ReceiptsTicker companies={enriched} />;
}
