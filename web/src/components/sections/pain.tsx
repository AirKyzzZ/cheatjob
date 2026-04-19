"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
} from "motion/react";
import { useEffect, useRef } from "react";
import { BlurText } from "@/components/ui/blur-text";
import { Eyebrow } from "@/components/ui/eyebrow";

function CountUp({
  target,
  suffix = "%",
  negative = false,
  delay = 0,
}: {
  target: number;
  suffix?: string;
  negative?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? target : 0);
  const rounded = useTransform(
    mv,
    (v) => (negative ? "−" : "") + Math.round(v) + suffix
  );

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(mv, target, {
      duration: 1.4,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, target, delay, mv, reduce]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function Pain() {
  return (
    <section
      className="relative bg-cream py-28 md:py-40 px-6 md:px-10"
      aria-label="Le problème du recrutement étudiant"
    >
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
        {/* Left: copy */}
        <div className="md:col-span-6 flex flex-col gap-8">
          <Eyebrow>Le problème</Eyebrow>
          <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink max-w-[18ch]">
            <BlurText
              text="Les RH cherchent des clones."
              as="span"
              className="block"
            />
            <BlurText
              text="Les managers cherchent des solutions."
              as="span"
              className="block text-muted"
            />
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.65] text-muted max-w-[44ch]">
            Le recrutement classique est un jeu truqué. Tu envoies un PDF dans le
            vide, en espérant qu&apos;un algorithme te remarque. Pendant ce
            temps, ceux qui connaissent le manager obtiennent l&apos;entretien.
          </p>
        </div>

        {/* Right: stats + quote */}
        <div className="md:col-span-6 flex flex-col gap-14">
          <div className="grid grid-cols-2 gap-8 md:gap-12 border-b border-border-subtle pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="font-serif text-[72px] md:text-[88px] leading-none text-ink mb-3 tabular-nums">
                <CountUp target={40} />
              </div>
              <p className="text-[13px] font-sans text-muted leading-[1.5] max-w-[22ch]">
                des étudiants cherchent plus de 3 mois
              </p>
              <p className="text-[11px] font-sans italic text-muted-soft mt-2">
                Baromètre Seekube, 2024
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.7,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="font-serif text-[72px] md:text-[88px] leading-none text-ink mb-3 tabular-nums">
                <CountUp target={85} negative />
              </div>
              <p className="text-[13px] font-sans text-muted leading-[1.5] max-w-[22ch]">
                d&apos;offres d&apos;alternance en PME en 2024
              </p>
              <p className="text-[11px] font-sans italic text-muted-soft mt-2">
                Rapport JobTeaser, 2024
              </p>
            </motion.div>
          </div>

          {/* ONE italic line — the cutting pull quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <span
              className="absolute -left-5 top-0 font-serif italic text-[56px] leading-none text-burgundy select-none"
              aria-hidden
            >
              &ldquo;
            </span>
            <p className="font-serif italic text-[28px] md:text-[36px] leading-[1.2] text-ink pl-6">
              Le système marche très bien. Juste pas pour toi.
            </p>
            <footer className="font-sans text-[12px] uppercase tracking-[0.22em] font-medium text-muted mt-5 pl-6">
              Maxime, fondateur
            </footer>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
