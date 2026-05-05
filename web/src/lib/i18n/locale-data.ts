import type { Locale } from "@/types/locale";

type LocaleDisplay = {
  nativeName: string;
  htmlLang: string;
  beta: boolean;
};

export const localeDisplay: Record<Locale, LocaleDisplay> = {
  fr: { nativeName: "Français", htmlLang: "fr", beta: false },
  en: { nativeName: "English", htmlLang: "en", beta: false },
  es: { nativeName: "Español", htmlLang: "es", beta: true },
  de: { nativeName: "Deutsch", htmlLang: "de", beta: true },
};
