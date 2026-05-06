"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { BlurText } from "@/components/ui/blur-text";
import { ScrollHint } from "@/components/ui/scroll-hint";
import { Play } from "lucide-react";
import { EVENTS, track } from "@/lib/analytics/events";
import { useWaitlist } from "@/components/waitlist/waitlist-context";
import { useSectionViewed } from "@/hooks/use-section-viewed";
import { MagazineSpread } from "./magazine-spread";

const STRIPE_LINK_SPRINT = process.env.NEXT_PUBLIC_STRIPE_LINK_SPRINT;

export function Hero() {
  const t = useTranslations("hero");
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
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16 h-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1">
          {/* LEFT — Copy */}
          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            {/* Headline — ONE italic moment per screen (charter rule).
                BlurText entrance is the only motion in this hero. */}
            <h1 className="font-serif text-[56px] md:text-[88px] lg:text-[112px] xl:text-[124px] leading-[0.92] tracking-[-0.04em] text-cream max-w-[13ch]">
              <BlurText
                text={t("headline")}
                as="span"
                triggerOnLoad
                stagger={0.085}
                duration={0.7}
                delay={0.3}
                className="block"
              />
              <BlurText
                text={t("headlineItalic")}
                as="span"
                italic
                triggerOnLoad
                stagger={0.085}
                duration={0.7}
                delay={0.65}
                className="block"
              />
            </h1>

            <p className="font-sans text-[17px] md:text-[20px] leading-[1.55] text-cream/80 max-w-[42rem]">
              {t("subhead")}{" "}
              <span className="text-cream">{t("subheadEmphasis")}</span>
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              {STRIPE_LINK_SPRINT ? (
                <a
                  href={STRIPE_LINK_SPRINT}
                  onClick={() => track(EVENTS.HeroPrimaryCta, { destination: "stripe" })}
                  rel="noopener"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-[12px] bg-cream text-ink text-[15px] font-semibold font-sans transition-transform hover:-translate-y-0.5"
                >
                  {t("ctaPrimaryStripe")}
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
                  {t("ctaPrimaryWaitlist")}
                </button>
              )}
              <a
                href="#wedge"
                onClick={() => track(EVENTS.HeroSecondaryCta, { target: "wedge" })}
                className="inline-flex items-center gap-2 h-14 px-6 rounded-[12px] text-cream text-[14px] font-medium font-sans border border-cream/15 hover:bg-white/5 transition-colors"
              >
                <Play className="size-3.5" fill="currentColor" strokeWidth={0} aria-hidden />
                {t("ctaSecondary")}
              </a>
            </div>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="text-[13px] font-sans text-cream/55 max-w-md italic"
            >
              {t("microproof")}
            </motion.p>
          </div>

          {/* RIGHT — Magazine spread (typographic transcription of one real reply) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <MagazineSpread />
          </div>
        </div>
      </div>

      <ScrollHint />
    </section>
  );
}
