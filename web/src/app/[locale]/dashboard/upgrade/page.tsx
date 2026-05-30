import { setRequestLocale, getTranslations } from "next-intl/server";
import { PACKS, hasPackPrice } from "@/lib/billing/packs";
import { PackButton, UpgradeViewedTracker } from "./_components/upgrade-client";

const NAMES: Record<string, string> = {
  decollage: "Décollage",
  terrain: "Terrain",
  reseau: "Réseau",
};

const TIERS = [
  { key: "decollage", price: "9 €", credits: PACKS.decollage.credits, tag: "tagDecollage", feat: null, popular: false },
  { key: "terrain", price: "29 €", credits: PACKS.terrain.credits, tag: "tagTerrain", feat: "featTerrain", popular: true },
  { key: "reseau", price: "59 €", credits: PACKS.reseau.credits, tag: "tagReseau", feat: "featReseau", popular: false },
] as const;

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app.upgrade");

  return (
    <div className="py-12 md:py-16">
      <UpgradeViewedTracker />
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-5">
          {t("eyebrow")}
        </p>
        <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.05] tracking-[-0.02em] text-ink">
          {t("title")}
        </h1>
        <p className="mt-5 font-sans text-[15px] leading-relaxed text-muted-soft">{t("subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3 max-w-4xl mx-auto">
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            className={`relative rounded-2xl bg-white p-7 flex flex-col ${
              tier.popular ? "border-2 border-burgundy" : "border border-ink/10"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-7 bg-burgundy text-cream text-[11px] font-sans font-medium px-3 py-1 rounded-full">
                {t("popular")}
              </span>
            )}
            <p className="font-serif text-[24px] text-ink">{NAMES[tier.key]}</p>
            <p className="mt-1 font-sans text-[13px] text-muted-soft">{t(tier.tag)}</p>
            <p className="mt-6 font-serif text-[40px] text-ink leading-none">{tier.price}</p>
            <p className="mt-3 font-sans text-[14px] text-ink">
              <span className="font-medium">{tier.credits}</span> {t("unit")}
            </p>
            <p className="mt-1 font-sans text-[12px] text-muted-soft">{t("neverExpire")}</p>
            {tier.feat && (
              <p className="mt-4 font-sans text-[13px] text-ink/70 leading-relaxed">{t(tier.feat)}</p>
            )}
            <div className="mt-auto pt-8">
              <PackButton
                pack={tier.key}
                locale={locale}
                label={t("cta")}
                disabled={!hasPackPrice(tier.key)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
