import type { Locale } from "@/types/locale";

export const locales = ["fr", "en", "es", "de"] as const satisfies readonly Locale[];

// English is the fallback for browsers whose Accept-Language header does
// not match any supported locale. Browsers in French/Spanish/German will
// still be detected and routed to their respective locale via the
// next-intl middleware (Accept-Language → matching prefix).
export const defaultLocale: Locale = "en";

export const productionLocales: readonly Locale[] = ["fr", "en"];
export const betaLocales: readonly Locale[] = ["es", "de"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isBetaLocale(locale: Locale): boolean {
  return betaLocales.includes(locale);
}
