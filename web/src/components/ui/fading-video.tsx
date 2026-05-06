"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  /** Optional poster image URL — shown instantly while video buffers. */
  poster?: string;
  /** ms — fade in / out duration (default 500). */
  fadeMs?: number;
  /** seconds — start fade-out this far before video ends (default 0.55). */
  fadeOutLead?: number;
  /** Inline style overrides (object-fit, object-position, etc.). */
  style?: React.CSSProperties;
};

/**
 * Looping background video with custom rAF-driven crossfade.
 *
 * Pattern from motionsites.ai-style hero references. CSS transitions
 * cannot resume mid-fade if a new fade fires (they snap), so we drive
 * opacity with requestAnimationFrame and read the current opacity at
 * each fade start so successive fades are continuous.
 *
 * Looping is implemented manually (not via the `loop` attribute) so we
 * can fade-out at end and fade-in on restart.
 */
export function FadingVideo({
  src,
  className = "",
  poster,
  fadeMs = 500,
  fadeOutLead = 0.55,
  style,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function fadeTo(target: number, duration: number) {
      const el = videoRef.current;
      if (!el) return;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const startOpacity = parseFloat(el.style.opacity || "0");
      const startTime = performance.now();
      function step(now: number) {
        const el2 = videoRef.current;
        if (!el2) return;
        const t = Math.min((now - startTime) / duration, 1);
        el2.style.opacity = String(startOpacity + (target - startOpacity) * t);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else rafRef.current = null;
      }
      rafRef.current = requestAnimationFrame(step);
    }

    function onLoaded() {
      const el = videoRef.current;
      if (!el) return;
      el.style.opacity = "0";
      el.play().catch(() => {});
      fadeTo(1, fadeMs);
    }

    function onTimeUpdate() {
      const el = videoRef.current;
      if (!el || !Number.isFinite(el.duration)) return;
      const remaining = el.duration - el.currentTime;
      if (!fadingOutRef.current && remaining <= fadeOutLead && remaining > 0) {
        fadingOutRef.current = true;
        fadeTo(0, fadeMs);
      }
    }

    function onEnded() {
      const el = videoRef.current;
      if (!el) return;
      el.style.opacity = "0";
      setTimeout(() => {
        const el2 = videoRef.current;
        if (!el2) return;
        el2.currentTime = 0;
        el2.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, fadeMs);
      }, 100);
    }

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [fadeMs, fadeOutLead]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden
      className={className}
      // Start at opacity 1 if a poster is provided so the still frame is
      // visible while the video buffers; the rAF fade then takes over once
      // playback begins. Without poster, start at 0 (original behavior).
      style={{ opacity: poster ? 1 : 0, ...style }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
