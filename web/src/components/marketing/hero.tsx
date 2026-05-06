"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Play } from "lucide-react";
import { FadingVideo } from "@/components/ui/fading-video";
import { EVENTS, track } from "@/lib/analytics/events";
import { useWaitlist } from "@/components/waitlist/waitlist-context";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const STRIPE_LINK_SPRINT = process.env.NEXT_PUBLIC_STRIPE_LINK_SPRINT;

const HERO_VIDEO = "/videos/hero.mp4";
const HERO_POSTER = "/videos/hero-poster.jpg";

/**
 * Hero — cinematic-magazine layout.
 *
 *  Single section-wide cream radial gradient on top of the full-bleed
 *  video — solid cream behind the text, smoothly fading out toward
 *  the corners where the video reveals itself. No "card" shape, no
 *  inset boundary, so the transition reads as a soft atmospheric wash
 *  rather than a pasted panel.
 */
export function Hero() {
  const t = useTranslations("hero");
  const waitlist = useWaitlist();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("hero", sectionRef);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative w-full overflow-hidden bg-cream"
      style={{ minHeight: "min(94vh, 980px)" }}
    >
      {/* Full-bleed cinematic video */}
      <FadingVideo
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      />

      {/* Section-wide cream radial gradient.
          The gradient covers the entire section — strong cream in the
          centre/upper-middle (where the text lives), fading smoothly to
          fully transparent at the corners and edges. Many stops at
          decreasing opacities so each step of the fade is subtle and
          there is no visible boundary. The video reveals itself in the
          peripheral zones as ambient atmosphere. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 62% 70% at 50% 42%, #FAF9F6 0%, #FAF9F6 30%, rgba(250,249,246,0.95) 45%, rgba(250,249,246,0.85) 55%, rgba(250,249,246,0.7) 65%, rgba(250,249,246,0.5) 74%, rgba(250,249,246,0.32) 82%, rgba(250,249,246,0.16) 90%, rgba(250,249,246,0.06) 96%, rgba(250,249,246,0) 100%)",
        }}
      />

      {/* Soft top + bottom edge fades — keep nav area always cream and
          hand off cleanly to the next section. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 z-[5] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #FAF9F6 0%, rgba(250,249,246,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 z-[5] pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, #FAF9F6 0%, rgba(250,249,246,0) 100%)",
        }}
      />

      {/* Hero content — anchored to top, no card chrome around it. */}
      <div
        className="relative z-10 mx-auto flex w-full justify-center px-4 sm:px-6 md:px-10"
        style={{
          paddingTop: "clamp(108px, 13vh, 152px)",
          paddingBottom: "clamp(72px, 10vh, 128px)",
        }}
      >
        <div className="flex w-full max-w-[920px] flex-col items-center text-center">
          {/* Cover line */}
          <h1
            className="font-serif font-normal text-ink animate-fade-rise max-w-[15ch]"
            style={{
              fontSize: "clamp(48px, 9vw, 120px)",
              lineHeight: 0.94,
              letterSpacing: "-0.04em",
            }}
          >
            {t("headline")}{" "}
            <em className="not-italic font-serif italic text-muted">
              {t("headlineItalic")}
            </em>
          </h1>

          {/* Dek */}
          <p className="font-sans text-muted text-[15px] sm:text-[17px] leading-relaxed max-w-[56ch] mt-6 animate-fade-rise-delay">
            {t("subhead")}{" "}
            <span className="text-ink">{t("subheadEmphasis")}</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 animate-fade-rise-delay-2">
            {STRIPE_LINK_SPRINT ? (
              <a
                href={STRIPE_LINK_SPRINT}
                onClick={() =>
                  track(EVENTS.HeroPrimaryCta, { destination: "stripe" })
                }
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-9 py-3.5 text-[14.5px] font-medium font-sans transition-transform hover:scale-[1.03]"
              >
                {t("ctaPrimaryStripe")}
                <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  track(EVENTS.HeroPrimaryCta, { destination: "waitlist" });
                  waitlist.open({ source: "hero" });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-9 py-3.5 text-[14.5px] font-medium font-sans transition-transform hover:scale-[1.03]"
              >
                {t("ctaPrimaryWaitlist")}
                <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
              </button>
            )}
            <a
              href="#wedge"
              onClick={() => track(EVENTS.HeroSecondaryCta, { target: "wedge" })}
              className="inline-flex items-center gap-2 px-3 py-2 text-ink/70 hover:text-ink text-[13.5px] font-medium font-sans transition-colors"
            >
              <Play className="size-3" fill="currentColor" strokeWidth={0} aria-hidden />
              {t("ctaSecondary")}
            </a>
          </div>

          {/* Microproof */}
          <p className="font-sans italic text-[12.5px] text-muted mt-5 animate-fade-rise-delay-3 max-w-[40ch]">
            {t("microproof")}
          </p>
        </div>
      </div>
    </section>
  );
}
