"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Mail } from "lucide-react";
import { EVENTS, track } from "@/lib/analytics/events";
import { useSectionViewed } from "@/hooks/use-section-viewed";

type EvidenceItem = {
  src: string;
  company: string;
  role: string;
  outcome: string;
  date: string;
};

/**
 * Evidence — real email screenshot gallery.
 *
 * Drop PNGs into /public/evidence/{01,02,03,04}.png
 * Until the user provides real screenshots, each card shows an editorial
 * placeholder (burgundy mail glyph, filename hint) so the layout is complete.
 */
const EVIDENCE: EvidenceItem[] = [
  {
    src: "/evidence/01.png",
    company: "Dataiku",
    role: "Software Engineer Intern",
    outcome: "Entretien confirmé",
    date: "mars 2026",
  },
  {
    src: "/evidence/02.png",
    company: "Deezer",
    role: "Alternance Développeur Fullstack",
    outcome: "Candidature retenue",
    date: "mars 2026",
  },
  {
    src: "/evidence/03.png",
    company: "ExtraJool",
    role: "Stage développement",
    outcome: "Réponse directe du CEO",
    date: "oct. 2025",
  },
  {
    src: "/evidence/04.png",
    company: "HOP HOP IMMO",
    role: "Convention de stage",
    outcome: "Stage validé",
    date: "nov. 2025",
  },
  {
    src: "/evidence/05.png",
    company: "SQLI",
    role: "Alternance Développeur Fullstack",
    outcome: "Échange planifié",
    date: "mars 2026",
  },
];

function EvidenceCard({
  item,
  index,
}: {
  item: EvidenceItem;
  index: number;
}) {
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration: 0.65,
        delay: reduce ? 0 : index * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() =>
        track(EVENTS.EvidenceCardHover, {
          company: item.company,
          index,
        })
      }
      className="group flex flex-col gap-4"
    >
      {/* Screenshot frame */}
      <div className="relative aspect-[8/5] rounded-[10px] overflow-hidden bg-white border border-border-subtle shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_12px_32px_rgba(0,0,0,0.04)]">
        {/* Top browser-chrome strip */}
        <div className="absolute top-0 inset-x-0 h-7 bg-cream-soft border-b border-border-subtle flex items-center gap-1.5 px-3 z-10">
          <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
          <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
          <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
          <span className="ml-auto font-mono text-[9px] text-muted-soft uppercase tracking-[0.2em]">
            gmail · {item.date}
          </span>
        </div>

        {failed ? (
          // Editorial placeholder when no screenshot is provided yet
          <div
            className="absolute inset-0 pt-7 flex flex-col items-center justify-center gap-3 p-6 text-center bg-cream-soft"
            aria-hidden
          >
            <div className="size-12 rounded-full bg-burgundy/10 flex items-center justify-center">
              <Mail className="size-5 text-burgundy" strokeWidth={1.4} />
            </div>
            <p className="font-serif italic text-[15px] text-ink leading-[1.4] max-w-[14ch]">
              Preuve à venir
            </p>
            <p className="font-mono text-[9px] text-muted-soft uppercase tracking-[0.2em]">
              /evidence/0{index + 1}.png
            </p>
            <p className="sr-only">Screenshot manquant pour {item.company}</p>
          </div>
        ) : (
          <Image
            src={item.src}
            alt={`Email envoyé à ${item.company} pour ${item.role}`}
            fill
            className="object-cover object-top pt-7 transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            unoptimized
            onError={() => setFailed(true)}
          />
        )}

        {/* Outcome ribbon */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="inline-flex items-center gap-2 bg-ink text-cream px-3 py-1.5 rounded-[6px] shadow-lg">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            <span className="text-[11px] font-sans font-semibold tracking-wide">
              {item.outcome}
            </span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <figcaption className="flex flex-col gap-0.5">
        <span className="font-serif text-[18px] text-ink leading-none">
          {item.company}
        </span>
        <span className="font-sans text-[12px] text-muted">{item.role}</span>
      </figcaption>
    </motion.figure>
  );
}

export function Evidence() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("evidence", sectionRef);
  return (
    <section
      ref={sectionRef}
      className="bg-cream-soft py-28 md:py-40 px-6 md:px-10 border-y border-border-subtle"
      aria-label="Preuves — emails envoyés et réponses obtenues"
    >
      <div className="mx-auto max-w-[1280px] flex flex-col gap-14 md:gap-20">
        <div className="flex flex-col gap-6 max-w-[820px]">
          <Eyebrow>Preuves</Eyebrow>
          <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink max-w-[22ch]">
            Ce n&apos;est pas une promesse.{" "}
            <span className="italic">C&apos;est une boîte de réception.</span>
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.65] text-muted max-w-[48ch]">
            Des messages envoyés. Des réponses reçues. Le genre de preuve
            qu&apos;Indeed ne montrera jamais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {EVIDENCE.map((item, i) => (
            <EvidenceCard key={item.src} item={item} index={i} />
          ))}
        </div>

        <p className="text-center font-sans italic text-[14px] text-muted">
          Emails réels, envoyés par le fondateur avec la méthode Cheatjob. Noms
          des recruteurs anonymisés, sociétés conservées par transparence.
        </p>
      </div>
    </section>
  );
}
