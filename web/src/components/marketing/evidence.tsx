"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Mail } from "lucide-react";
import { EVENTS, track } from "@/lib/analytics/events";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const EVIDENCE_KEYS = ["01", "02", "03", "04", "05"] as const;

type EvidenceCardProps = {
  itemKey: string;
  index: number;
};

function EvidenceCard({ itemKey, index }: EvidenceCardProps) {
  const t = useTranslations("evidence");
  const company = t(`items.${itemKey}.company`);
  const role = t(`items.${itemKey}.role`);
  const outcome = t(`items.${itemKey}.outcome`);
  const date = t(`items.${itemKey}.date`);
  const src = `/evidence/${itemKey}.png`;
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
        track(EVENTS.EvidenceCardHover, { company, index })
      }
      className="group flex flex-col gap-4"
    >
      <div className="relative aspect-[8/5] rounded-[10px] overflow-hidden bg-white border border-border-subtle shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_12px_32px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 inset-x-0 h-7 bg-cream-soft border-b border-border-subtle flex items-center gap-1.5 px-3 z-10">
          <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
          <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
          <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
          <span className="ml-auto font-mono text-[9px] text-muted-soft uppercase tracking-[0.2em]">
            gmail · {date}
          </span>
        </div>

        {failed ? (
          <div
            className="absolute inset-0 pt-7 flex flex-col items-center justify-center gap-3 p-6 text-center bg-cream-soft"
            aria-hidden
          >
            <div className="size-12 rounded-full bg-burgundy/10 flex items-center justify-center">
              <Mail className="size-5 text-burgundy" strokeWidth={1.4} />
            </div>
            <p className="font-serif italic text-[15px] text-ink leading-[1.4] max-w-[14ch]">
              {t("placeholderLabel")}
            </p>
            <p className="font-mono text-[9px] text-muted-soft uppercase tracking-[0.2em]">
              /evidence/{itemKey}.png
            </p>
          </div>
        ) : (
          <Image
            src={src}
            alt={t("altPattern", { company, role })}
            fill
            className="object-cover object-top pt-7 transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            unoptimized
            onError={() => setFailed(true)}
          />
        )}

        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="inline-flex items-center gap-2 bg-ink text-cream px-3 py-1.5 rounded-[6px] shadow-lg">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            <span className="text-[11px] font-sans font-semibold tracking-wide">
              {outcome}
            </span>
          </div>
        </div>
      </div>

      <figcaption className="flex flex-col gap-0.5">
        <span className="font-serif text-[18px] text-ink leading-none">
          {company}
        </span>
        <span className="font-sans text-[12px] text-muted">{role}</span>
      </figcaption>
    </motion.figure>
  );
}

export function Evidence() {
  const t = useTranslations("evidence");
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("evidence", sectionRef);
  return (
    <section
      ref={sectionRef}
      id="evidence"
      className="bg-cream-soft py-28 md:py-40 px-6 md:px-10 border-y border-border-subtle"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1280px] flex flex-col gap-14 md:gap-20">
        <div className="flex flex-col gap-6 max-w-[820px]">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink max-w-[22ch]">
            {t("headlineLine1")}{" "}
            <span className="italic">{t("headlineItalic")}</span>
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.65] text-muted max-w-[48ch]">
            {t("body")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {EVIDENCE_KEYS.map((key, i) => (
            <EvidenceCard key={key} itemKey={key} index={i} />
          ))}
        </div>

        <p className="text-center font-sans italic text-[14px] text-muted">
          {t("footerCaption")}
        </p>
      </div>
    </section>
  );
}
