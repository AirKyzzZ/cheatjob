"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Play } from "lucide-react";
import { FadingVideo } from "@/components/ui/fading-video";
import { EVENTS, track } from "@/lib/analytics/events";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const HERO_VIDEO = "/videos/hero.mp4";
const HERO_POSTER = "/videos/hero-poster.jpg";

/**
 * Hero — Aethera template.
 *
 *  Cream surface fills the top of the section. All hero text (headline,
 *  dek, CTAs, microproof) lives in normal document flow at the top —
 *  always on solid cream, never wrapped by the video. The cinematic
 *  loop occupies the lower band of the section, anchored to the floor,
 *  starting just below where the text content ends. Cream-to-transparent
 *  gradients top + bottom of the video so it eases in/out of the
 *  surrounding cream.
 *
 *  Sizing is responsive via clamp() so the same composition works mobile
 *  → ultrawide without breakpoint-by-breakpoint tuning. Top padding is
 *  large enough that the floating nav pill never overlaps the headline.
 */
export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("hero", sectionRef);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative w-full min-h-screen overflow-hidden bg-cream"
    >
      {/* Hero content — normal flow, always on cream, never overlapped
          by the video. Top padding clears the floating nav pill with
          breathing room; total content height stays compact so the
          video band gets most of the viewport on big screens (Aethera
          template proportions). */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{
          paddingTop: "clamp(104px, 12vh, 144px)",
          paddingBottom: "clamp(28px, 4vh, 56px)",
        }}
      >
        {/* Cover line — bigger mobile floor so phones read with weight,
            smaller cap on ultrawide so the video band gets generous room. */}
        <h1
          className="font-serif font-normal text-ink animate-fade-rise max-w-[18ch]"
          style={{
            fontSize: "clamp(60px, 7vw, 100px)",
            lineHeight: 0.96,
            letterSpacing: "-0.035em",
          }}
        >
          {t("headline")}{" "}
          <em className="not-italic font-serif italic text-muted">
            {t("headlineItalic")}
          </em>
        </h1>

        {/* Description */}
        <p className="font-sans text-muted text-base sm:text-lg max-w-2xl mt-6 leading-relaxed animate-fade-rise-delay">
          {t("subhead")}{" "}
          <span className="text-ink">{t("subheadEmphasis")}</span>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-7 animate-fade-rise-delay-2">
          <Link
            href={`/${locale}/sign-up`}
            onClick={() => track(EVENTS.HeroPrimaryCta, { destination: "sign-up" })}
            className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-12 py-4 text-[15px] font-medium font-sans transition-transform hover:scale-[1.03]"
          >
            {t("ctaPrimaryWaitlist")}
            <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
          </Link>
          <a
            href="#wedge"
            onClick={() => track(EVENTS.HeroSecondaryCta, { target: "wedge" })}
            className="inline-flex items-center gap-2 px-3 py-2 text-ink/70 hover:text-ink text-[14px] font-medium font-sans transition-colors"
          >
            <Play className="size-3" fill="currentColor" strokeWidth={0} aria-hidden />
            {t("ctaSecondary")}
          </a>
        </div>

        {/* Microproof */}
        <p className="font-sans italic text-[13px] text-muted mt-5 animate-fade-rise-delay-3 max-w-[40ch]">
          {t("microproof")}
        </p>
      </div>

      {/* Video — lower band. Bigger on wide screens (up to 60 vh) so it
          dominates the section like the Aethera reference. Cream
          gradients top + bottom soften the seams. */}
      <div
        aria-hidden
        className="absolute inset-x-0 z-0 pointer-events-none"
        style={{
          bottom: 0,
          top: "auto",
          height: "clamp(320px, 52vh, 640px)",
        }}
      >
        <FadingVideo
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 35%" }}
        />
        {/* Top fade — shorter so it eases the seam without eating into
            the visible video frame. */}
        <div
          className="absolute inset-x-0 top-0 h-14"
          style={{
            background:
              "linear-gradient(180deg, #FAF9F6 0%, rgba(250,249,246,0.5) 50%, rgba(250,249,246,0) 100%)",
          }}
        />
        {/* Bottom fade — video into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background:
              "linear-gradient(0deg, rgba(250,249,246,0.55) 0%, rgba(250,249,246,0) 100%)",
          }}
        />
      </div>
    </section>
  );
}
