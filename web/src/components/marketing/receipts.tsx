import { fetchBrandLogoUrl } from "@/lib/brandfetch";
import { ReceiptsTicker } from "./receipts-ticker";

// 15 French scaleups — credible stage / first-job employers, mix of
// fintech, healthtech, marketplaces, B2B SaaS, and mobility.
// Adding/removing a company is a single-line change here.
const COMPANIES: { name: string; domain: string }[] = [
  { name: "Qonto", domain: "qonto.com" },
  { name: "Alan", domain: "alan.com" },
  { name: "PayFit", domain: "payfit.com" },
  { name: "Spendesk", domain: "spendesk.com" },
  { name: "Pigment", domain: "pigment.com" },
  { name: "Contentsquare", domain: "contentsquare.com" },
  { name: "BlaBlaCar", domain: "blablacar.com" },
  { name: "Mistral AI", domain: "mistral.ai" },
  { name: "Back Market", domain: "backmarket.com" },
  { name: "Aircall", domain: "aircall.io" },
  { name: "Swile", domain: "swile.co" },
  { name: "Pennylane", domain: "pennylane.com" },
  { name: "Ankorstore", domain: "ankorstore.com" },
  { name: "Ledger", domain: "ledger.com" },
  { name: "ManoMano", domain: "manomano.com" },
];

/**
 * Server Component — fetches each brand's wordmark logo via Brandfetch
 * once at build/revalidate time, then hands the resolved URLs to the
 * client ticker. Doing this on the server keeps the API key off the
 * wire and means the browser only ever sees public CDN URLs.
 */
export async function Receipts() {
  const enriched = await Promise.all(
    COMPANIES.map(async (c) => ({
      ...c,
      logoUrl: await fetchBrandLogoUrl(c.domain),
    }))
  );
  return <ReceiptsTicker companies={enriched} />;
}
