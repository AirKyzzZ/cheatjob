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
import { useTranslations } from "next-intl";
import { BlurText } from "@/components/ui/blur-text";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useSectionViewed } from "@/hooks/use-section-viewed";

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
  const t = useTranslations("pain");
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("pain", sectionRef);
  return (
    <section
      ref={sectionRef}
      className="relative bg-cream py-28 md:py-40 px-6 md:px-10"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
        <div className="md:col-span-6 flex flex-col gap-8">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-serif text-[52px] md:text-[80px] lg:text-[96px] leading-[0.98] tracking-[-0.035em] text-ink max-w-[18ch]">
            <BlurText text={t("headlineLine1")} as="span" className="block" />
            <BlurText
              text={t("headlineLine2")}
              as="span"
              className="block text-muted"
            />
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.65] text-muted max-w-[44ch]">
            {t("body")}
          </p>
        </div>

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
                {t("stat1Label")}
              </p>
              <p className="text-[11px] font-sans italic text-muted-soft mt-2">
                {t("stat1Source")}
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
                {t("stat2Label")}
              </p>
              <p className="text-[11px] font-sans italic text-muted-soft mt-2">
                {t("stat2Source")}
              </p>
            </motion.div>
          </div>

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
              {t("pullQuote")}
            </p>
            <footer className="font-sans text-[12px] uppercase tracking-[0.22em] font-medium text-muted mt-5 pl-6">
              {t("pullQuoteAttribution")}
            </footer>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
