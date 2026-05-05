"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { BypassPath } from "@/components/ui/bypass-path";
import { useSectionViewed } from "@/hooks/use-section-viewed";

export function Handoff() {
  const reduce = useReducedMotion();
  const t = useTranslations("handoff");
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("handoff", sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink text-cream py-24 md:py-32 px-6 md:px-10 overflow-hidden"
      aria-hidden
    >
      {/* Soft ambient glow to tie this to the hero aesthetic */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(107,31,40,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1100px] flex flex-col items-center gap-10 md:gap-14">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          className="text-[11px] uppercase tracking-[0.22em] font-sans font-semibold text-cream/60"
        >
          {t("eyebrow")}
        </motion.span>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full"
        >
          <BypassPath
            variant="horizontal"
            tone="dark"
            className="w-full h-auto"
          />
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif italic text-[22px] md:text-[32px] leading-[1.3] text-center max-w-[30ch] text-cream/90"
        >
          {t("italicLine")}
        </motion.p>
      </div>
    </section>
  );
}
