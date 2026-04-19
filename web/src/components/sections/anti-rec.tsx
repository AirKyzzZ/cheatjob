"use client";

import { motion, useReducedMotion } from "motion/react";
import { Eyebrow } from "@/components/ui/eyebrow";

type Card = {
  line: string;
  mood: "out" | "in";
};

const CARDS: Card[] = [
  {
    line: "Si tu crois encore qu'un CV bien aligné suffit, passe ton tour.",
    mood: "out",
  },
  {
    line: "Si tu aimes remplir des formulaires et patienter, passe ton tour.",
    mood: "out",
  },
  {
    line: "Si contacter directement un manager te gêne, passe ton tour.",
    mood: "out",
  },
  {
    line: "Si tu veux une réponse plus qu'un rituel, entre.",
    mood: "in",
  },
];

export function AntiRec() {
  const reduce = useReducedMotion();
  return (
    <section
      className="bg-cream py-28 md:py-36 px-6 md:px-10"
      aria-label="Ce produit n'est pas pour tout le monde"
    >
      <div className="mx-auto max-w-[1100px] flex flex-col gap-14 md:gap-16">
        <div className="flex flex-col gap-6 max-w-[720px]">
          <Eyebrow>Qui ne devrait pas lire la suite</Eyebrow>
          <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink max-w-[20ch]">
            Si tu crois encore au mérite pur, <span className="italic">ferme cet onglet.</span>
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.65] text-muted max-w-[48ch]">
            Cheatjob n&apos;est pas pour tout le monde. Et on préfère te le dire
            avant que tu sortes la carte bancaire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.line}
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
                {card.line}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
