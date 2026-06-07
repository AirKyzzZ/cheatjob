"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { isBetaLocale, defaultLocale } from "@/lib/i18n/config";
import { localeDisplay } from "@/lib/i18n/locale-data";
// Global Window.posthog typing lives in @/lib/analytics/locale; importing
// for side effects keeps both files in sync.
import "@/lib/analytics/locale";
import type { Locale } from "@/types/locale";

const STORAGE_KEY = "cheatjob.betaBannerDismissed";

// useLayoutEffect on the client (set the CSS var before paint, no flash); plain
// useEffect on the server to avoid React's SSR useLayoutEffect warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function BetaLocaleBanner({ locale }: { locale: string }) {
  const t = useTranslations("betaBanner");
  const [dismissed, setDismissed] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const visible = isBetaLocale(locale as Locale) && !dismissed;

  // The bar is position:fixed, so it no longer pushes content. Broadcast its
  // height as --beta-banner-h; the nav and the page content offset by it so they
  // sit below the bar instead of under the fixed nav. Reset to 0 when hidden.
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!visible || !el) {
      root.style.setProperty("--beta-banner-h", "0px");
      return;
    }
    const apply = () => root.style.setProperty("--beta-banner-h", `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--beta-banner-h", "0px");
    };
  }, [visible]);

  if (!visible) return null;

  function dismiss() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
    window.posthog?.capture("locale_beta_banner_dismissed", { locale });
  }

  return (
    <div
      ref={ref}
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 border-b border-cream/10 bg-ink px-4 py-2.5 text-[13px] text-cream"
    >
      <span className="max-w-[60ch] text-center leading-[1.5] opacity-90">
        {t("message", { defaultLocaleName: localeDisplay[defaultLocale].nativeName })}
      </span>
      <button
        type="button"
        onClick={dismiss}
        className="font-medium underline underline-offset-2 opacity-80 transition-opacity hover:opacity-100"
      >
        {t("dismiss")}
      </button>
    </div>
  );
}
