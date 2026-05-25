// 15 French scaleups — credible stage / first-job employers, mix of
// fintech, healthtech, marketplaces, B2B SaaS, and mobility.
// Adding/removing a company is a single-line change here; after editing,
// run `npm --prefix web run fetch:brand-logos` to refresh the JSON cache.

export type BrandCompany = { name: string; domain: string };

export const BRAND_COMPANIES: BrandCompany[] = [
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
