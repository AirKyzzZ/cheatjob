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
  const waitlist = useWaitlist();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("hero", sectionRef);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative w-full min-h-screen overflow-hidden bg-cream"
    >
      {/* Hero content — normal flow, always on cream, never overlapped
          by the video. Top padding clears the floating nav pill (top-4 +
          h-14 = 72 px) with breathing room. */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{
          paddingTop: "clamp(112px, 14vh, 168px)",
          paddingBottom: "clamp(40px, 6vh, 80px)",
        }}
      >
        {/* Cover line */}
        <h1
          className="font-serif font-normal text-ink animate-fade-rise max-w-[16ch]"
          style={{
            fontSize: "clamp(56px, 9vw, 124px)",
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
          }}
        >
          {t("headline")}{" "}
          <em className="not-italic font-serif italic text-muted">
            {t("headlineItalic")}
          </em>
        </h1>

        {/* Description */}
        <p className="font-sans text-muted text-base sm:text-lg max-w-2xl mt-7 leading-relaxed animate-fade-rise-delay">
          {t("subhead")}{" "}
          <span className="text-ink">{t("subheadEmphasis")}</span>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-9 animate-fade-rise-delay-2">
          {STRIPE_LINK_SPRINT ? (
            <a
              href={STRIPE_LINK_SPRINT}
              onClick={() => track(EVENTS.HeroPrimaryCta, { destination: "stripe" })}
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-12 py-4 text-[15px] font-medium font-sans transition-transform hover:scale-[1.03]"
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
              className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-12 py-4 text-[15px] font-medium font-sans transition-transform hover:scale-[1.03]"
            >
              {t("ctaPrimaryWaitlist")}
              <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
            </button>
          )}
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
        <p className="font-sans italic text-[13px] text-muted mt-6 animate-fade-rise-delay-3 max-w-[40ch]">
          {t("microproof")}
        </p>
      </div>

      {/* Video — lives in the lower band. Height taken from the section
          minimum so the video starts where the text ends and fills down
          to the bottom of the hero. Cream gradients top + bottom soften
          the seams. */}
      <div
        aria-hidden
        className="absolute inset-x-0 z-0 pointer-events-none"
        style={{
          bottom: 0,
          top: "auto",
          height: "clamp(280px, 38vh, 460px)",
        }}
      >
        <FadingVideo
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Top fade — cream into video */}
        <div
          className="absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "linear-gradient(180deg, #FAF9F6 0%, rgba(250,249,246,0.6) 45%, rgba(250,249,246,0) 100%)",
          }}
        />
        {/* Bottom fade — video into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-20"
          style={{
            background:
              "linear-gradient(0deg, rgba(250,249,246,0.55) 0%, rgba(250,249,246,0) 100%)",
          }}
        />
      </div>
    </section>
  );
}
