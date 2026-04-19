"use client";

import { useEffect } from "react";
import { EVENTS, track } from "@/lib/analytics/events";

const BUCKETS = [30, 60, 120, 300] as const;

export function useTimeOnPage() {
  useEffect(() => {
    const start = Date.now();
    const timers = BUCKETS.map((seconds) =>
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          track(EVENTS.TimeOnPageBucket, {
            seconds,
            elapsed_ms: Date.now() - start,
          });
        }
      }, seconds * 1000)
    );
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);
}
