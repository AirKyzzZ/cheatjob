"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setPersonProps } from "@/lib/analytics/events";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
] as const;

export function useUtmCapture() {
  const params = useSearchParams();

  useEffect(() => {
    if (!params) return;
    const captured: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) captured[`initial_${k}`] = v;
    }
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        captured.initial_referrer_host = ref.host;
      } catch {
        // noop
      }
    }
    if (Object.keys(captured).length > 0) {
      setPersonProps(captured);
    }
  }, [params]);
}
