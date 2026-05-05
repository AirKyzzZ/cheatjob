"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useSectionViewed } from "@/hooks/use-section-viewed";

type Receipt = {
  date: string;
  company: string;
  roleKey: "growth" | "data" | "product" | "marketing" | "hr" | "ops";
  outcomeKey: "interview" | "fastReply2h" | "fastReply40min";
};

const RECEIPTS: Receipt[] = [
  { date: "28.03", company: "Qonto", roleKey: "growth", outcomeKey: "interview" },
  { date: "02.04", company: "Alan", roleKey: "data", outcomeKey: "interview" },
  { date: "05.04", company: "Doctolib", roleKey: "product", outcomeKey: "fastReply2h" },
  { date: "09.04", company: "Mirakl", roleKey: "marketing", outcomeKey: "interview" },
  { date: "11.04", company: "Back Market", roleKey: "hr", outcomeKey: "fastReply40min" },
  { date: "14.04", company: "PayFit", roleKey: "ops", outcomeKey: "interview" },
];

export function Receipts() {
  const t = useTranslations("receipts");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("receipts", sectionRef);
  return (
    <section
      ref={sectionRef}
      className="bg-cream border-y border-border-subtle overflow-hidden"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-5">
        <div className="flex items-center gap-6 overflow-hidden">
          <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] font-sans font-semibold text-burgundy">
            {t("label")}
          </span>

          <div className="relative flex-1 overflow-hidden">
            <motion.div
              className="flex items-center gap-10 whitespace-nowrap"
              initial={reduce ? false : { x: 0 }}
              animate={reduce ? undefined : { x: "-50%" }}
              transition={
                reduce
                  ? undefined
                  : { duration: 60, ease: "linear", repeat: Infinity }
              }
            >
              {[...RECEIPTS, ...RECEIPTS].map((r, i) => (
                <span
                  key={`${r.company}-${i}`}
                  className="flex items-center gap-3 text-[13px] font-sans"
                >
                  <span className="font-mono text-[11px] text-muted tabular-nums">
                    {r.date}
                  </span>
                  <span className="text-ink">
                    <span className="font-semibold">{r.company}</span>
                    <span className="text-muted"> · {t(`roles.${r.roleKey}`)}</span>
                  </span>
                  <span className="text-burgundy font-medium">
                    {t(`outcomes.${r.outcomeKey}`)}
                  </span>
                  <span className="text-border-subtle" aria-hidden>
                    ——
                  </span>
                </span>
              ))}
            </motion.div>

            <div
              className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cream to-transparent pointer-events-none"
              aria-hidden
            />
            <div
              className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream to-transparent pointer-events-none"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
