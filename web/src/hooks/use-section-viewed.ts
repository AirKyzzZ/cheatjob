"use client";

import { useEffect, useRef } from "react";
import { EVENTS, track } from "@/lib/analytics/events";

const DWELL_MS = 1500;
const fired = new Set<string>();

export function useSectionViewed(
  section: string,
  ref: React.RefObject<HTMLElement | null>
) {
  const enteredAt = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (fired.has(section)) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (fired.has(section)) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            enteredAt.current = performance.now();
            timeout = setTimeout(() => {
              if (fired.has(section)) return;
              fired.add(section);
              const dwell = enteredAt.current
                ? Math.round(performance.now() - enteredAt.current)
                : DWELL_MS;
              track(EVENTS.SectionViewed, { section, dwell_ms: dwell });
            }, DWELL_MS);
          } else {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
            enteredAt.current = null;
          }
        }
      },
      { threshold: [0.25, 0.5] }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [section, ref]);
}
