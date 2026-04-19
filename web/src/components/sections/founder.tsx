"use client";

import { motion, useReducedMotion } from "motion/react";
import { Eyebrow } from "@/components/ui/eyebrow";

/**
 * Founder story — asymmetric, near-silent section.
 * One italic pull line, two paragraphs, a signature slab.
 * No card. No entrance flourish. Just type on paper.
 */
export function Founder() {
  const reduce = useReducedMotion();

  return (
    <section
      className="bg-cream py-32 md:py-48 px-6 md:px-10"
      aria-label="Pourquoi Cheatjob existe"
    >
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
        {/* Column — offset left with margin */}
        <div className="md:col-span-8 md:col-start-3 flex flex-col gap-12">
          <Eyebrow>Pourquoi Cheatjob existe</Eyebrow>

          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[40px] md:text-[56px] lg:text-[64px] leading-[1.05] tracking-[-0.03em] text-ink max-w-[20ch]"
          >
            J&apos;ai trouvé mon stage comme ça. Puis un poste dans une licorne.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            {/* Signature slab — editorial left margin */}
            <aside className="md:col-span-3 pt-2">
              <div className="border-l-2 border-burgundy pl-5">
                <p className="font-serif text-[18px] text-ink leading-[1.3]">
                  Maxime Mansiet
                </p>
                <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted mt-2">
                  Fondateur
                </p>
                <p className="font-sans text-[11px] italic text-muted-soft mt-1">
                  Bordeaux, 2026
                </p>
              </div>
            </aside>

            {/* Story */}
            <div className="md:col-span-9 flex flex-col gap-8 font-sans text-[18px] md:text-[19px] leading-[1.7] text-ink">
              <p>
                En 2024, j&apos;ai postulé à 80 stages via Indeed et Welcome to
                the Jungle. Zéro réponse. J&apos;ai arrêté, j&apos;ai cherché les
                emails des responsables, j&apos;ai écrit 15 messages
                personnalisés. J&apos;ai eu 4 entretiens et signé en 3 semaines.
              </p>
              <p>
                Un an plus tard, j&apos;ai utilisé la même méthode pour
                décrocher un poste dans une licorne française.{" "}
                <span className="font-serif italic text-burgundy">
                  La porte principale est verrouillée. On a juste copié la clé
                  de service.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
