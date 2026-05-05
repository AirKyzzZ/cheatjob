"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { motion, type MotionValue } from "motion/react";
import { localeDisplay } from "@/lib/i18n/locale-data";
import { locales } from "@/lib/i18n/config";
import type { Locale } from "@/types/locale";

type Props = {
  /** Optional motion-driven color, used to match the nav's scrolled state. */
  linkColor?: MotionValue<string>;
};

export function LocaleSwitcher({ linkColor }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    const stripped = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    startTransition(() => {
      router.replace(`/${next}${stripped}`);
    });
  }

  return (
    <label className="relative inline-flex items-center text-[12px] font-sans">
      <span className="sr-only">{t("localeSwitcherLabel")}</span>
      <motion.select
        value={locale}
        onChange={(e) => switchTo(e.target.value as Locale)}
        disabled={isPending}
        style={linkColor ? { color: linkColor } : undefined}
        className="bg-transparent appearance-none border border-current/20 rounded-full pl-3 pr-7 py-1 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:border-current/50 font-medium uppercase tracking-[0.04em]"
      >
        {locales.map((l) => (
          <option key={l} value={l} className="bg-cream text-ink uppercase">
            {l.toUpperCase()}
            {localeDisplay[l].beta ? " (β)" : ""}
          </option>
        ))}
      </motion.select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 opacity-60"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4.5 6 7.5 9 4.5" />
      </svg>
    </label>
  );
}
