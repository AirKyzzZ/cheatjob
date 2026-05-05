"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const CARD_KEYS = [
  { key: "out1", mood: "out" },
  { key: "out2", mood: "out" },
  { key: "out3", mood: "out" },
  { key: "in", mood: "in" },
] as const;

export function AntiRec() {
  const t = useTranslations("antiRec");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("anti_rec", sectionRef);
  return (
    <section
      ref={sectionRef}
      className="bg-cream py-28 md:py-36 px-6 md:px-10"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1100px] flex flex-col gap-14 md:gap-16">
        <div className="flex flex-col gap-6 max-w-[720px]">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink max-w-[20ch]">
            {t("headlineLead")}{" "}
            <span className="italic">{t("headlineItalic")}</span>
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.65] text-muted max-w-[48ch]">
            {t("body")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {CARD_KEYS.map((card, i) => (
            <motion.div
              key={card.key}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.6,
                delay: reduce ? 0 : i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={
                card.mood === "out"
                  ? "bg-white border border-border-subtle rounded-[12px] p-7 md:p-8"
                  : "bg-ink text-cream border border-ink rounded-[12px] p-7 md:p-8 md:col-span-2"
              }
            >
              <p
                className={
                  card.mood === "out"
                    ? "font-serif text-[22px] md:text-[26px] leading-[1.3] text-muted"
                    : "font-serif italic text-[28px] md:text-[36px] leading-[1.25] text-cream"
                }
              >
                {t(`cards.${card.key}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
