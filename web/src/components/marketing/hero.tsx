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
 *  Full-bleed cinematic video. A rectangular cream "panel" sits behind
 *  the text, sized to follow the content shape, with a large soft
 *  box-shadow halo that feathers the rectangle edges into the video.
 *  Net visual: a clearly defined reading rectangle (matches the div
 *  shape) with smoothly diffused edges — no oval blob, no hard card.
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

      {/* Hero content + cream rectangle backdrop. The cream div is
          rectangular (shaped like the content), and an outsized
          box-shadow blur creates the soft edge falloff so the rectangle
          dissolves into the video on all four sides. */}
      <div
        className="relative z-10 mx-auto flex w-full justify-center px-4 sm:px-6 md:px-10"
        style={{
          paddingTop: "clamp(108px, 13vh, 152px)",
          paddingBottom: "clamp(72px, 10vh, 128px)",
        }}
      >
        <div className="relative w-full max-w-[920px]">
          {/* Cream rectangle backdrop — closely sized to the content with
              a tighter halo so the box-shadow doesn't spread the cream
              across most of the section. */}
          <div
            aria-hidden
            className="absolute -inset-x-2 -inset-y-3 sm:-inset-x-4 sm:-inset-y-6 md:-inset-x-6 md:-inset-y-8"
            style={{
              backgroundColor: "#FAF9F6",
              // Tight three-stop halo: ~150 px max reach (was ~460 px).
              // Wide enough to soften the rectangle edge into the video,
              // narrow enough that the video occupies most of the hero.
              boxShadow:
                "0 0 24px 6px #FAF9F6, 0 0 64px 16px rgba(250,249,246,0.55), 0 0 140px 32px rgba(250,249,246,0.18)",
            }}
          />

          {/* Content sits on top of the rectangle. */}
          <div className="relative flex flex-col items-center text-center px-4 sm:px-8 md:px-12 lg:px-16">
            {/* Cover line — bigger mobile floor so phones read confidently. */}
            <h1
              className="font-serif font-normal text-ink animate-fade-rise max-w-[15ch]"
              style={{
                fontSize: "clamp(60px, 10vw, 124px)",
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
      </div>
    </section>
  );
}
