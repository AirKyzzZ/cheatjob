"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useSectionViewed } from "@/hooks/use-section-viewed";

/**
 * Editorial page-break — magazine convention. Full-bleed cream section
 * with one cutting line of serif type, separating the long-form pitch
 * (Evidence → Founder → AntiRec) from the commercial moment (Pricing).
 *
 * No graphics, no chrome. The brand voice is the design.
 */
export function PageBreak() {
  const t = useTranslations("pageBreak");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("page_break", sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream py-24 md:py-32 lg:py-40 px-6 md:px-10 border-y border-border-subtle"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1100px] flex flex-col items-center text-center gap-8 md:gap-10">
        <motion.blockquote
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            duration: 0.9,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="font-serif text-ink leading-[0.95] tracking-[-0.04em]"
        >
          <span className="block text-[44px] md:text-[68px] lg:text-[88px] xl:text-[104px]">
            {t("quote")}
          </span>
          <span className="block italic text-burgundy text-[44px] md:text-[68px] lg:text-[88px] xl:text-[104px]">
            {t("quoteItalic")}
          </span>
        </motion.blockquote>
      </div>
    </section>
  );
}
