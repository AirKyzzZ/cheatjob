"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/eyebrow";
import { X, ArrowRight } from "lucide-react";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const ROW_KEYS = ["row1", "row2", "row3", "row4"] as const;

export function Versus() {
  const t = useTranslations("versus");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("versus", sectionRef);
  return (
    <section
      ref={sectionRef}
      className="bg-cream py-28 md:py-40 px-6 md:px-10 border-y border-border-subtle"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1200px] flex flex-col gap-14 md:gap-20">
        <div className="flex flex-col gap-5 max-w-[720px]">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink">
            {t("headline")}
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.65] text-muted max-w-[48ch]">
            {t("body")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border-subtle rounded-[12px] overflow-hidden">
          <div className="p-8 md:p-10 bg-cream-soft relative">
            <div className="flex items-center gap-2 mb-8">
              <X className="size-4 text-muted shrink-0" strokeWidth={2} aria-hidden />
              <span className="text-[11px] uppercase tracking-[0.22em] font-sans font-semibold text-muted">
                {t("beforeColumn")}
              </span>
            </div>
            <ul className="flex flex-col gap-5 font-sans text-[16px] md:text-[17px] text-muted leading-[1.5]">
              {ROW_KEYS.map((key, i) => (
                <motion.li
                  key={`before-${key}`}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    duration: 0.55,
                    delay: reduce ? 0 : i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="line-through decoration-muted/40"
                >
                  {t(`rows.${key}Before`)}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="p-8 md:p-10 bg-white relative border-t md:border-t-0 md:border-l border-border-subtle">
            <div className="flex items-center gap-2 mb-8">
              <ArrowRight
                className="size-4 text-burgundy shrink-0"
                strokeWidth={2.2}
                aria-hidden
              />
              <span className="text-[11px] uppercase tracking-[0.22em] font-sans font-semibold text-burgundy">
                {t("afterColumn")}
              </span>
            </div>
            <ul className="flex flex-col gap-5 font-sans text-[16px] md:text-[17px] text-ink leading-[1.5]">
              {ROW_KEYS.map((key, i) => (
                <motion.li
                  key={`after-${key}`}
                  initial={reduce ? false : { opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    duration: 0.55,
                    delay: reduce ? 0 : i * 0.08 + 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="font-medium"
                >
                  {t(`rows.${key}After`)}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
