"use client";

import { useEffect, useRef } from "react";
import { EVENTS, track } from "@/lib/analytics/events";

const THRESHOLDS = [25, 50, 75, 100] as const;

export function useScrollDepth() {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    const check = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / total) * 100));
      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.current.has(t)) {
          fired.current.add(t);
          track(EVENTS.ScrollDepth, { threshold: t });
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        check();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
