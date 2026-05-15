"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import { EVENTS, track } from "@/lib/analytics/events";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const STRIPE_LINKS: Record<string, string | undefined> = {
  sprint: process.env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
  mois: process.env.NEXT_PUBLIC_STRIPE_LINK_MOIS,
  vie: process.env.NEXT_PUBLIC_STRIPE_LINK_VIE,
};

const PLAN_IDS = ["sprint", "mois", "vie"] as const;
const FEATURED_PLAN = "mois";

export function Pricing() {
  const t = useTranslations("pricing");
  const reduce = useReducedMotion();
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("pricing", sectionRef);
  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="bg-cream py-28 md:py-40 px-6 md:px-10"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1200px] flex flex-col gap-14 md:gap-20">
        <div className="flex flex-col gap-6">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-serif text-[52px] md:text-[80px] lg:text-[96px] leading-[0.98] tracking-[-0.035em] text-ink max-w-[20ch]">
            {t("headlineLead")}{" "}
            <span className="italic">{t("headlineItalic")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {PLAN_IDS.map((planId, i) => {
            const featured = planId === FEATURED_PLAN;
            const features = t.raw(`plans.${planId}.features`) as string[];
            return (
              <motion.div
                key={planId}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.6,
                  delay: reduce ? 0 : i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onHoverStart={() => track(EVENTS.PricingPlanHover, { plan: planId })}
                className={cn(
                  "relative bg-white border border-border-subtle rounded-[12px] p-8 md:p-10 flex flex-col",
                  featured && "border-burgundy border-t-[3px]"
                )}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-burgundy text-cream text-[10px] uppercase tracking-[0.22em] font-sans font-semibold px-4 py-1 rounded-sm">
                    {t("popularBadge")}
                  </span>
                )}

                <div className="flex flex-col gap-2 mb-8">
                  <h3 className="text-[11px] uppercase tracking-[0.22em] font-sans font-semibold text-muted">
                    {t(`plans.${planId}.name`)}
                  </h3>
                  <p className="text-[14px] text-muted font-sans">
                    {t(`plans.${planId}.subtitle`)}
                  </p>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-[64px] leading-none text-ink tabular-nums">
                    {t(`plans.${planId}.price`)}
                  </span>
                </div>
                <p className="text-[13px] text-muted font-sans mb-10">
                  {t(`plans.${planId}.priceSub`)}
                </p>

                <ul className="flex flex-col gap-3 font-sans text-[14px] text-ink mb-10 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check
                        className="size-4 text-burgundy shrink-0 mt-0.5"
                        strokeWidth={2.2}
                        aria-hidden
                      />
                      <span className="leading-[1.5]">{f}</span>
                    </li>
                  ))}
                </ul>

                {(() => {
                  const href = STRIPE_LINKS[planId];
                  const className = cn(
                    "w-full h-12 rounded-[10px] text-[14px] font-semibold font-sans transition-colors inline-flex items-center justify-center",
                    featured
                      ? "bg-burgundy text-cream hover:bg-burgundy-deep"
                      : "border border-burgundy text-burgundy hover:bg-burgundy/5"
                  );
                  if (href) {
                    return (
                      <a
                        href={href}
                        onClick={() =>
                          track(EVENTS.PricingCtaClick, {
                            plan: planId,
                            destination: "stripe",
                          })
                        }
                        className={className}
                        rel="noopener"
                      >
                        {t(`plans.${planId}.cta`)}
                      </a>
                    );
                  }
                  return (
                    <Link
                      href={`/${locale}/sign-up?plan=${planId}`}
                      onClick={() =>
                        track(EVENTS.PricingCtaClick, {
                          plan: planId,
                          destination: "sign-up",
                        })
                      }
                      className={className}
                    >
                      {t("ctaWaitlistFallback")}
                    </Link>
                  );
                })()}

                <p className="mt-3 text-center font-sans text-[11px] uppercase tracking-[0.22em] text-muted-soft">
                  {t("preOrderCaption", { delivery: t("deliveryLabel") })}
                </p>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center font-sans text-[13px] text-muted max-w-[58ch] mx-auto leading-[1.6]">
          {t("footerNote")}
        </p>
      </div>
    </section>
  );
}
