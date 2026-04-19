"use client";

import { useEffect, useRef } from "react";
import { EVENTS, track } from "@/lib/analytics/events";

export function useExitIntent() {
  const fired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseOut = (e: MouseEvent) => {
      if (fired.current) return;
      if (e.relatedTarget) return;
      if (e.clientY > 20) return;
      fired.current = true;
      track(EVENTS.ExitIntent, {
        scroll_y: window.scrollY,
        elapsed_ms:
          performance.timing
            ? Date.now() - performance.timing.navigationStart
            : undefined,
      });
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, []);
}
