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
 *  Full-bleed cinematic video bleeds across the entire section. All
 *  hero text sits inside a centered cream "panel" whose backdrop is
 *  feathered into the video by a long, multi-stop radial mask + a
 *  separate horizontal gradient on each side. Net effect: text on a
 *  reliably solid cream surface, video smoothly visible around it
 *  with no visible card edge.
 *
 *  Tunables grouped at the top of the file so the editorial pass is
 *  one or two values away.
 */
const PANEL_INSET_X = "-inset-x-16 sm:-inset-x-20 md:-inset-x-32 lg:-inset-x-40";
const PANEL_INSET_Y = "-inset-y-16 sm:-inset-y-24 md:-inset-y-32 lg:-inset-y-40";

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

      {/* Light cream wash over the whole video — quiets saturation so
          the headline is comfortable to read against the brightest
          frames. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{ background: "rgba(250, 249, 246, 0.18)" }}
      />

      {/* Hero content — anchored to top with nav clearance + breathing
          room, no longer vertically centered. Closer feel + smaller
          composition. */}
      <div
        className="relative z-10 mx-auto flex w-full justify-center px-4 sm:px-6 md:px-10"
        style={{
          paddingTop: "clamp(108px, 13vh, 152px)",
          paddingBottom: "clamp(72px, 10vh, 128px)",
        }}
      >
        <div className="relative w-full max-w-[980px]">
          {/* Feathered cream backdrop. Two stacked layers:
              1. A soft radial that defines the panel "core" — solid in the
                 middle 35–40%, gradually thinning to ~30% opacity at the
                 outer edge. Big inset extends the cream halo well past the
                 content so the fade has runway.
              2. A second outer wash with backdrop-blur(40px) — softens the
                 video pixels at the periphery so the perimeter reads as
                 hazy ambient color, never as a cropped slice. */}
          <div
            aria-hidden
            className={`absolute ${PANEL_INSET_X} ${PANEL_INSET_Y}`}
            style={{
              backdropFilter: "blur(56px) saturate(82%)",
              WebkitBackdropFilter: "blur(56px) saturate(82%)",
              background:
                "radial-gradient(ellipse 75% 80% at 50% 50%, #FAF9F6 0%, #FAF9F6 38%, rgba(250,249,246,0.92) 58%, rgba(250,249,246,0.55) 78%, rgba(250,249,246,0.18) 92%, rgba(250,249,246,0) 100%)",
            }}
          />

          {/* Inner solid cream — guarantees crisp text rendering even if
              the radial above thins out slightly under the type. Smaller
              radial so it feathers within the outer wash, not against the
              video. */}
          <div
            aria-hidden
            className="absolute -inset-x-4 -inset-y-6 sm:-inset-x-6 sm:-inset-y-10"
            style={{
              background:
                "radial-gradient(ellipse 65% 70% at 50% 50%, #FAF9F6 0%, #FAF9F6 60%, rgba(250,249,246,0) 100%)",
            }}
          />

          {/* Content */}
          <div className="relative flex flex-col items-center text-center px-4 sm:px-8 md:px-12 lg:px-16">
            {/* Cover line — slightly tighter scale */}
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
                onClick={() =>
                  track(EVENTS.HeroSecondaryCta, { target: "wedge" })
                }
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
