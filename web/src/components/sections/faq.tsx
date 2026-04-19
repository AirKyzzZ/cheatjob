"use client";

import { motion, AnimatePresence } from "motion/react";
import { useId, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import { EVENTS, track } from "@/lib/analytics/events";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const QA = [
  {
    q: "C'est légal d'envoyer un email à quelqu'un qu'on ne connaît pas ?",
    a: "Oui, dans le cadre d'une prospection B2B pertinente. Le RGPD autorise le contact vers un email professionnel sous motif d'intérêt légitime, ce qui est le cas d'une recherche de stage ou d'alternance. Cheatjob ne stocke aucune base d'emails — les adresses sont reconstruites en temps réel à partir d'informations publiques. Chaque message que tu envoies inclut l'option de désinscription requise.",
  },
  {
    q: "Est-ce que le recruteur va savoir que c'est un robot ?",
    a: "Non. Cheatjob écrit un premier brouillon que tu relis, corriges et valides avant envoi. C'est toi qui envoies, depuis ta boîte mail. Tu restes l'auteur du message. Et franchement, personne ne rédige un email de prospection from scratch en 2026, pas même les commerciaux.",
  },
  {
    q: "Si je trouve mon alternance en 2 semaines, je peux arrêter ?",
    a: "Oui. Le plan Sprint termine automatiquement au bout de 30 jours, sans renouvellement. Le plan Mois s'annule en un clic depuis ton tableau de bord. Le plan Vie n'a pas de renouvellement.",
  },
  {
    q: "Ça marche pour quel type de contrats ?",
    a: "Stages de fin d'études, alternance (apprentissage et contrat pro), premier CDI pour jeunes diplômés. Les templates sont optimisés pour le marché étudiant français. La méthode fonctionne aussi pour les jobs d'été, mais ce n'est pas notre spécialité.",
  },
  {
    q: "Mon email est envoyé depuis quelle adresse ?",
    a: "Depuis ton adresse personnelle, via ta boîte Gmail ou Outlook connectée. Cheatjob ne t'envoie rien au nom d'un domaine intermédiaire. Ton identité reste la tienne, c'est la seule façon de ne pas finir en spam.",
  },
  {
    q: "Je suis en bac+2 en BTS, c'est pour moi ?",
    a: "Oui. Les étudiants de BTS représentent environ un tiers de notre audience. Les templates sont adaptés aux stages obligatoires courts autant qu'aux alternances longues.",
  },
];

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const buttonId = useId();
  return (
    <div className="border-b border-border-subtle" role="group">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-6 py-6 text-left"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="font-sans font-medium text-[17px] md:text-[18px] text-ink">
          {q}
        </span>
        <Plus
          className={cn(
            "size-5 text-muted shrink-0 transition-transform duration-300",
            open && "rotate-45 text-burgundy"
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-10 font-sans text-[15px] md:text-[16px] leading-[1.65] text-muted">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("faq", sectionRef);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="bg-cream py-24 md:py-32 px-6 md:px-10"
      aria-label="Questions fréquentes"
    >
      <div className="mx-auto max-w-[820px] flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-6">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] text-ink max-w-[22ch]">
            Les questions que se posent ceux qui font encore la queue.
          </h2>
        </div>

        <div className="border-t border-border-subtle">
          {QA.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              open={openIdx === i}
              onToggle={() => {
                const willOpen = openIdx !== i;
                setOpenIdx(willOpen ? i : null);
                if (willOpen) {
                  track(EVENTS.FaqExpanded, {
                    index: i,
                    question: item.q,
                  });
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
