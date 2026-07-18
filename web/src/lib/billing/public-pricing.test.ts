import { describe, expect, it } from "vitest";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import fr from "../../../messages/fr.json";

const EXPECTED_PACKS = {
  decollage: { price: 9, credits: 15 },
  terrain: { price: 29, credits: 50 },
  reseau: { price: 59, credits: 120 },
} as const;

const LOCALES = [
  {
    name: "fr",
    messages: fr,
    expiredCopy: /Pré-commande|Livraison juin 2026|Sprint|14€90|149€|Réserver/i,
  },
  {
    name: "en",
    messages: en,
    expiredCopy: /Pre-order|Shipping June 2026|Sprint|€14\.90|€149|Reserve/i,
  },
  {
    name: "es",
    messages: es,
    expiredCopy: /Pre-orden|Entrega junio 2026|Sprint|14€90|149€|Reservar/i,
  },
  {
    name: "de",
    messages: de,
    expiredCopy: /Vorbestellung|Lieferung Juni 2026|Sprint|14€90|149€|Reservieren/i,
  },
] as const;

function stringValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringValues);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(stringValues);
  }
  return [];
}

function integerValue(value: string | undefined): number | undefined {
  const match = value?.match(/\d+/g);
  if (match?.length !== 1) return undefined;
  return Number(match[0]);
}

describe("public pricing copy", () => {
  for (const locale of LOCALES) {
    it(`advertises the live credit packs in ${locale.name}`, () => {
      const plans = locale.messages.pricing.plans as Record<
        string,
        { price?: string; credits?: string }
      >;

      expect(Object.keys(plans)).toEqual(Object.keys(EXPECTED_PACKS));
      for (const [key, expected] of Object.entries(EXPECTED_PACKS)) {
        expect(integerValue(plans[key]?.price)).toBe(expected.price);
        expect(integerValue(plans[key]?.credits)).toBe(expected.credits);
      }
    });

    it(`contains no expired launch claims in ${locale.name}`, () => {
      const publicOffer = {
        hero: locale.messages.hero,
        pricing: locale.messages.pricing,
        faq: locale.messages.faq,
        finalCta: locale.messages.finalCta,
        footer: locale.messages.footer,
        waitlist: locale.messages.waitlist,
      };

      expect(stringValues(publicOffer).join("\n")).not.toMatch(locale.expiredCopy);
    });
  }
});
