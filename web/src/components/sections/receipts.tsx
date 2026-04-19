"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSectionViewed } from "@/hooks/use-section-viewed";

type Receipt = {
  date: string;
  company: string;
  role: string;
  outcome: string;
};

/**
 * Receipt strip — editorial marginalia. Narrow, timestamped evidence
 * fragments that feel like magazine margin notes. Ownable signature
 * motif beyond glass / gradients.
 */
const RECEIPTS: Receipt[] = [
  { date: "28.03", company: "Qonto", role: "Alternance Growth", outcome: "Entretien obtenu" },
  { date: "02.04", company: "Alan", role: "Stage Data", outcome: "Entretien obtenu" },
  { date: "05.04", company: "Doctolib", role: "Alternance Product", outcome: "Réponse en 2h" },
  { date: "09.04", company: "Mirakl", role: "Stage Marketing", outcome: "Entretien obtenu" },
  { date: "11.04", company: "Back Market", role: "Alternance RH", outcome: "Réponse en 40min" },
  { date: "14.04", company: "PayFit", role: "Stage Ops", outcome: "Entretien obtenu" },
];

export function Receipts() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("receipts", sectionRef);
  return (
    <section
      ref={sectionRef}
      className="bg-cream border-y border-border-subtle overflow-hidden"
      aria-label="Résultats récents"
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-5">
        <div className="flex items-center gap-6 overflow-hidden">
          <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] font-sans font-semibold text-burgundy">
            Reçus · semaine 15
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
                    <span className="text-muted"> · {r.role}</span>
                  </span>
                  <span className="text-burgundy font-medium">{r.outcome}</span>
                  <span className="text-border-subtle" aria-hidden>
                    ——
                  </span>
                </span>
              ))}
            </motion.div>

            {/* Fade edges */}
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
