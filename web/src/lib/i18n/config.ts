import type { Locale } from "@/types/locale";

export const locales = ["fr", "en", "es", "de"] as const satisfies readonly Locale[];

export const defaultLocale: Locale = "fr";

export const productionLocales: readonly Locale[] = ["fr", "en"];
export const betaLocales: readonly Locale[] = ["es", "de"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isBetaLocale(locale: Locale): boolean {
  return betaLocales.includes(locale);
}
