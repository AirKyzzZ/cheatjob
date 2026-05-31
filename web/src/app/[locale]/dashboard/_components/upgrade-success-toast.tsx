"use client";

import { useEffect, useRef, useState } from "react";
import { track, EVENTS } from "@/lib/analytics/events";

export function UpgradeSuccessToast({ title, body }: { title: string; body: string }) {
  const fired = useRef(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (fired.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") !== "success") return;
    fired.current = true;
    const pack = params.get("pack");
    track(EVENTS.UpgradePurchased, pack ? { pack } : undefined);
    setShow(true);
    // Strip the query string via the History API (no navigation, so the toast
    // stays mounted) so a refresh can neither re-fire the event nor re-show.
    window.history.replaceState(null, "", window.location.pathname);
    const timer = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-ink text-cream shadow-xl px-5 py-4 flex items-start gap-4"
    >
      <div>
        <p className="font-serif text-[18px] leading-snug">{title}</p>
        <p className="mt-1 font-sans text-[13px] leading-relaxed text-cream/75">{body}</p>
      </div>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="Close"
        className="shrink-0 -mr-1 -mt-1 text-cream/50 hover:text-cream transition-colors text-[20px] leading-none"
      >
        ×
      </button>
    </div>
  );
}
