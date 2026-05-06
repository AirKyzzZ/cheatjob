"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ScrollRevealText } from "@/components/ui/scroll-reveal-text";
import { useSectionViewed } from "@/hooks/use-section-viewed";

export function Founder() {
  const t = useTranslations("founder");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("founder", sectionRef);

  return (
    <section
      ref={sectionRef}
      className="bg-cream py-32 md:py-48 px-6 md:px-10"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
        <div className="md:col-span-8 md:col-start-3 flex flex-col gap-12">
          <Eyebrow>{t("eyebrow")}</Eyebrow>

          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[48px] md:text-[72px] lg:text-[88px] leading-[1.0] tracking-[-0.035em] text-ink max-w-[20ch]"
          >
            {t("headline")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            <aside className="md:col-span-3 pt-2">
              <div className="border-l-2 border-burgundy pl-5">
                <p className="font-serif text-[18px] text-ink leading-[1.3]">
                  {t("name")}
                </p>
                <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted mt-2">
                  {t("title")}
                </p>
                <p className="font-sans text-[11px] italic text-muted-soft mt-1">
                  {t("place")}
                </p>
              </div>
            </aside>

            {/* Story — scroll-driven word reveal for editorial pacing */}
            <div className="md:col-span-9 flex flex-col gap-8 font-sans text-[18px] md:text-[19px] leading-[1.7] text-ink">
              <ScrollRevealText className="text-ink">
                {t("paragraph1")}
              </ScrollRevealText>
              <p className="text-ink relative">
                <ScrollRevealText as="span" className="inline">
                  {t("paragraph2Lead")}
                </ScrollRevealText>{" "}
                <span className="font-serif italic text-burgundy">
                  {t("paragraph2Italic")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
