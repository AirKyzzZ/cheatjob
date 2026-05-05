"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { isBetaLocale, defaultLocale } from "@/lib/i18n/config";
import { localeDisplay } from "@/lib/i18n/locale-data";
import type { Locale } from "@/types/locale";

const STORAGE_KEY = "cheatjob.betaBannerDismissed";

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
    };
  }
}

export function BetaLocaleBanner({ locale }: { locale: string }) {
  const t = useTranslations("betaBanner");
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (!isBetaLocale(locale as Locale)) return null;
  if (dismissed) return null;

  function dismiss() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
    window.posthog?.capture("locale_beta_banner_dismissed", { locale });
  }

  return (
    <div
      role="status"
      className="w-full bg-ink text-cream border-b border-cream/10 px-4 py-2.5 text-[13px] flex items-center justify-center gap-3"
    >
      <span className="opacity-90 max-w-[60ch] text-center leading-[1.5]">
        {t("message", { defaultLocaleName: localeDisplay[defaultLocale].nativeName })}
      </span>
      <button
        type="button"
        onClick={dismiss}
        className="underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity font-medium"
      >
        {t("dismiss")}
      </button>
    </div>
  );
}
