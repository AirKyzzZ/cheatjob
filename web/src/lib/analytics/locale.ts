import type { Locale } from "@/types/locale";

declare global {
  interface Window {
    posthog?: {
      register: (props: Record<string, unknown>) => void;
      capture: (event: string, props?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Attach `$locale` as a PostHog super-property so every captured event
 * carries the active locale without each call site repeating it.
 */
export function registerLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.posthog?.register({ $locale: locale });
}
