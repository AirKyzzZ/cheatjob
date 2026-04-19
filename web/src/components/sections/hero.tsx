"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BlurText } from "@/components/ui/blur-text";
import { ProofPanel } from "@/components/ui/proof-panel";
import { ScrollHint } from "@/components/ui/scroll-hint";
import { Play } from "lucide-react";
import { EVENTS, track } from "@/lib/analytics/events";
import { useWaitlist } from "@/components/waitlist/waitlist-context";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const STRIPE_LINK_SPRINT = process.env.NEXT_PUBLIC_STRIPE_LINK_SPRINT;

type HeroProps = {
  /**
   * Optional full-bleed ambient video. If provided, renders under the
   * cinematic CSS backdrop. Leave undefined for the pure-CSS hero.
   */
  backgroundVideoSrc?: string;
};

export function Hero({ backgroundVideoSrc }: HeroProps) {
  const reduce = useReducedMotion();
  const waitlist = useWaitlist();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("hero", sectionRef);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden bg-ink text-cream isolate pt-36 pb-24"
    >
      {/* Optional ambient video — only if a src is supplied */}
      {backgroundVideoSrc && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src={backgroundVideoSrc} type="video/mp4" />
        </video>
      )}

      {/* Cinematic CSS backdrop — wavy organic burgundy blobs */}
      <div className="cinematic-backdrop" aria-hidden>
        <div className="cinematic-backdrop-accent" aria-hidden />
      </div>
      <div className="light-grain" aria-hidden />
      <div className="cinematic-fade-bottom" aria-hidden />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16 h-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1">
          {/* LEFT — Copy */}
          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            {/* Eyebrow */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-8 bg-burgundy" aria-hidden />
              <span className="text-[12px] md:text-[13px] uppercase tracking-[0.22em] font-sans font-medium text-cream/70">
                Le carnet d&apos;adresses que tu n&apos;as pas hérité
              </span>
            </motion.div>

            {/* Headline — ONE italic moment per screen (charter rule) */}
            <h1 className="font-serif text-[56px] md:text-[88px] lg:text-[112px] xl:text-[124px] leading-[0.92] tracking-[-0.04em] text-cream max-w-[13ch]">
              <BlurText
                text="Tu n'auras pas ton stage"
                as="span"
                triggerOnLoad
                stagger={0.085}
                duration={0.7}
                delay={0.3}
                className="block"
              />
              <BlurText
                text="en postulant sur Indeed."
                as="span"
                italic
                triggerOnLoad
                stagger={0.085}
                duration={0.7}
                delay={0.65}
                className="block"
              />
            </h1>

            {/* Subhead */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-sans text-[17px] md:text-[20px] leading-[1.55] text-cream/80 max-w-[42rem]"
            >
              Cheatjob trouve l&apos;email du manager qui recrute, rédige ton
              message, te fait arriver au bon endroit.{" "}
              <span className="text-cream">
                Dans sa boîte mail. Pas dans celle des RH.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2"
            >
              {STRIPE_LINK_SPRINT ? (
                <a
                  href={STRIPE_LINK_SPRINT}
                  onClick={() =>
                    track(EVENTS.HeroPrimaryCta, { destination: "stripe" })
                  }
                  rel="noopener"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-[12px] bg-cream text-ink text-[15px] font-semibold font-sans transition-transform hover:-translate-y-0.5"
                >
                  Prendre le raccourci pour 29€
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    track(EVENTS.HeroPrimaryCta, { destination: "waitlist" });
                    waitlist.open({ source: "hero" });
                  }}
                  className="inline-flex items-center justify-center h-14 px-8 rounded-[12px] bg-cream text-ink text-[15px] font-semibold font-sans transition-transform hover:-translate-y-0.5"
                >
                  Réserver ma place pour 29€
                </button>
              )}
              <a
                href="#wedge"
                onClick={() =>
                  track(EVENTS.HeroSecondaryCta, { target: "wedge" })
                }
                className="inline-flex items-center gap-2 h-14 px-6 rounded-[12px] text-cream text-[14px] font-medium font-sans border border-cream/15 hover:bg-white/5 transition-colors"
              >
                <Play className="size-3.5" fill="currentColor" strokeWidth={0} aria-hidden />
                Voir comment ça marche
              </a>
            </motion.div>

            {/* Micro-proof */}
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="text-[13px] font-sans text-cream/55 max-w-md italic"
            >
              On appellera ça du culot, jusqu&apos;au moment où tu signes.
            </motion.p>
          </div>

          {/* RIGHT — Proof dossier */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ProofPanel />
          </div>
        </div>
      </div>

      <ScrollHint />
    </section>
  );
}
