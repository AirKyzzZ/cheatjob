"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BlurText } from "@/components/ui/blur-text";
import { BypassPath } from "@/components/ui/bypass-path";
import { EVENTS, track } from "@/lib/analytics/events";
import { useWaitlist } from "@/components/waitlist/waitlist-context";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const STRIPE_LINK_SPRINT = process.env.NEXT_PUBLIC_STRIPE_LINK_SPRINT;

export function FinalCTA() {
  const reduce = useReducedMotion();
  const waitlist = useWaitlist();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("final_cta", sectionRef);
  return (
    <section
      ref={sectionRef}
      className="bg-cream py-36 md:py-52 px-6 md:px-10 border-t border-border-subtle text-center"
      aria-label="Lancer Cheatjob"
    >
      <div className="mx-auto max-w-[1100px] flex flex-col items-center gap-14">
        {/* Signature bypass motif reappears here as closing statement */}
        <div className="w-full max-w-[520px] opacity-70">
          <BypassPath variant="diagonal" tone="light" className="w-full h-auto" />
        </div>

        <h2 className="font-serif text-[56px] md:text-[96px] lg:text-[120px] leading-[0.92] tracking-[-0.04em] text-ink max-w-[16ch]">
          <BlurText text="Arrête d'espérer." as="span" className="block" />
          <BlurText
            text="Écris aux bonnes personnes."
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
          {STRIPE_LINK_SPRINT ? (
            <a
              href={STRIPE_LINK_SPRINT}
              onClick={() =>
                track(EVENTS.FinalCtaClick, { destination: "stripe" })
              }
              rel="noopener"
              className="inline-flex items-center justify-center h-16 px-10 rounded-[12px] bg-burgundy text-cream text-[17px] font-semibold font-sans hover:bg-burgundy-deep hover:-translate-y-0.5 transition-all"
            >
              Prendre le raccourci pour 29€
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                track(EVENTS.FinalCtaClick, { destination: "waitlist" });
                waitlist.open({ source: "final_cta" });
              }}
              className="inline-flex items-center justify-center h-16 px-10 rounded-[12px] bg-burgundy text-cream text-[17px] font-semibold font-sans hover:bg-burgundy-deep hover:-translate-y-0.5 transition-all"
            >
              Réserver ma place
            </button>
          )}
          <p className="text-[13px] text-muted font-sans">
            Pré-commande · Livraison juin 2026 · Remboursement si non livré.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
