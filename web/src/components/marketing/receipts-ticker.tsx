"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useSectionViewed } from "@/hooks/use-section-viewed";

type CompanyEntry = {
  name: string;
  domain: string;
  /** Resolved Brandfetch CDN URL, or `null` when the API was unavailable. */
  logoUrl: string | null;
};

export function ReceiptsTicker({ companies }: { companies: CompanyEntry[] }) {
  const t = useTranslations("receipts");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("receipts", sectionRef);

  return (
    <section
      ref={sectionRef}
      // `group` so hovering anywhere on the strip lights up every logo
      // greyscale → full color in unison.
      className="group bg-cream border-y border-border-subtle py-12 md:py-16 overflow-hidden"
      aria-label={t("ariaLabel")}
    >
      <p className="text-center font-sans text-[10px] md:text-[11px] uppercase tracking-[0.32em] text-muted mb-10 md:mb-12">
        {t("trustLine")}
      </p>

      <div className="relative">
        <motion.div
          className="flex items-center gap-14 md:gap-16"
          initial={reduce ? false : { x: 0 }}
          animate={reduce ? undefined : { x: "-50%" }}
          transition={
            reduce
              ? undefined
              : { duration: 90, ease: "linear", repeat: Infinity }
          }
        >
          {[...companies, ...companies].map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              // Brand colors stay on; we just dim slightly by default and
              // pop to full opacity on section-hover. Greyscale would
              // strip the recognizability that the trust strip exists for.
              className="shrink-0 transition-opacity duration-500 opacity-75 group-hover:opacity-100"
            >
              {c.logoUrl ? (
                <Image
                  src={c.logoUrl}
                  alt={c.name}
                  // Wordmark lockups are wide; fix the height so every
                  // brand sits on the same baseline regardless of the
                  // source aspect ratio.
                  width={320}
                  height={80}
                  className="h-9 md:h-11 w-auto max-w-[200px] object-contain"
                  unoptimized
                  // Eager load: the strip animates continuously, so
                  // lazy-loading would block items past the initial
                  // viewport from ever rendering.
                  loading="eager"
                />
              ) : (
                <span className="font-sans font-semibold text-[20px] md:text-[24px] text-ink whitespace-nowrap tracking-tight">
                  {c.name}
                </span>
              )}
            </div>
          ))}
        </motion.div>

        <div
          className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-cream to-transparent pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-cream to-transparent pointer-events-none"
          aria-hidden
        />
      </div>
    </section>
  );
}
