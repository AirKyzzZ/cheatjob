"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { FlightDiagram } from "@/components/ui/flight-diagram";
import { useSectionViewed } from "@/hooks/use-section-viewed";

/**
 * Handoff — editorial visualization of the cheatjob bypass.
 *
 *  Replaces the previous static BypassPath with an interactive flight
 *  diagram: a letter takes off from the user's CV, arcs over the ATS/HR
 *  trash (with rejected platform logos), and lands in the manager's
 *  inbox. The motion is the section's whole reason for existing — the
 *  italic kicker and signature line frame it.
 */
export function Handoff() {
  const t = useTranslations("handoff");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("handoff", sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream text-ink py-24 md:py-32 px-6 md:px-10 overflow-hidden border-y border-border-subtle"
      aria-label="Le chemin que Cheatjob trace"
    >
      <div className="relative z-10 mx-auto max-w-[1200px] flex flex-col items-center gap-12 md:gap-16">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          className="text-[11px] uppercase tracking-[0.22em] font-sans font-semibold text-muted"
        >
          {t("eyebrow")}
        </motion.span>

        {/* Interactive flight diagram */}
        <FlightDiagram />

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif italic text-[22px] md:text-[32px] leading-[1.3] text-center max-w-[30ch] text-ink"
        >
          {t("italicLine")}
        </motion.p>
      </div>
    </section>
  );
}
