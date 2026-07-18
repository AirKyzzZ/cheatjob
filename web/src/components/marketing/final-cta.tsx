"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { BlurText } from "@/components/ui/blur-text";
import { BypassPath } from "@/components/ui/bypass-path";
import { EVENTS, track } from "@/lib/analytics/events";
import { useSectionViewed } from "@/hooks/use-section-viewed";

export function FinalCTA() {
  const t = useTranslations("finalCta");
  const reduce = useReducedMotion();
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("final_cta", sectionRef);

  return (
    <section
      ref={sectionRef}
      className="bg-cream py-36 md:py-52 px-6 md:px-10 border-t border-border-subtle text-center"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1100px] flex flex-col items-center gap-14">
        <div className="w-full max-w-[520px] opacity-70">
          <BypassPath variant="diagonal" tone="light" className="w-full h-auto" />
        </div>

        <h2 className="font-serif text-[64px] md:text-[112px] lg:text-[144px] leading-[0.9] tracking-[-0.045em] text-ink max-w-[16ch]">
          <BlurText text={t("headlineLead")} as="span" className="block" />
          <BlurText
            text={t("headlineItalic")}
            as="span"
            italic
            className="block"
          />
        </h2>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="flex flex-col items-center gap-5"
        >
          <Link
            href={`/${locale}/sign-up`}
            onClick={() => track(EVENTS.FinalCtaClick, { destination: "sign-up" })}
            className="inline-flex items-center justify-center h-16 px-10 rounded-[12px] bg-burgundy text-cream text-[17px] font-semibold font-sans hover:bg-burgundy-deep hover:-translate-y-0.5 transition-all"
          >
            {t("ctaPrimaryWaitlist")}
          </Link>
          <p className="text-[13px] text-muted font-sans">{t("subline")}</p>
        </motion.div>
      </div>
    </section>
  );
}
