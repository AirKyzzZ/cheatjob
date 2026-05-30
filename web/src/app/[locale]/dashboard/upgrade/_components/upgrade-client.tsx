"use client";

import { useEffect, useTransition } from "react";
import { createCheckout } from "@/server/actions/billing";
import { track, EVENTS } from "@/lib/analytics/events";

export function UpgradeViewedTracker() {
  useEffect(() => {
    track(EVENTS.UpgradeViewed);
  }, []);
  return null;
}

export function PackButton({
  pack,
  locale,
  label,
  disabled = false,
}: {
  pack: string;
  locale: string;
  label: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => {
        if (disabled) return;
        track(EVENTS.UpgradeCheckoutStarted, { pack });
        startTransition(async () => {
          const { url } = await createCheckout(pack, locale);
          window.location.href = url;
        });
      }}
      className="w-full h-11 rounded-xl bg-burgundy text-cream font-sans text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
    >
      {pending ? "…" : label}
    </button>
  );
}
