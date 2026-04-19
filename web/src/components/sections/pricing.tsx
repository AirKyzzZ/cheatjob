"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import posthog from "posthog-js";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

const LINKS: Record<string, string | undefined> = {
  sprint: process.env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
  mois: process.env.NEXT_PUBLIC_STRIPE_LINK_MOIS,
  vie: process.env.NEXT_PUBLIC_STRIPE_LINK_VIE,
};

const DELIVERY_LABEL = "Livraison juin 2026";

type Plan = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceSub: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "sprint",
    name: "Sprint",
    subtitle: "Le format one-shot",
    price: "29€",
    priceSub: "une fois, 30 jours d'accès",
    features: [
      "50 emails reconstruits",
      "Messages personnalisés illimités",
      "Templates alternance et stage",
      "Suivi automatique à J+7",
      "Tableau de bord des candidatures",
      "Annulation automatique en fin de période",
    ],
    cta: "Choisir Sprint",
  },
  {
    id: "mois",
    name: "Mois",
    subtitle: "Le format flexible",
    price: "14€90",
    priceSub: "par mois, sans engagement",
    features: [
      "100 emails reconstruits par mois",
      "Tout du plan Sprint",
      "Priorité support par email",
      "Exports CSV de tes candidatures",
      "Intégration Gmail et Outlook",
      "Historique complet de tes envois",
      "Une relance intelligente par prospect",
    ],
    cta: "Commencer",
    featured: true,
  },
  {
    id: "vie",
    name: "Vie",
    subtitle: "Le format définitif",
    price: "149€",
    priceSub: "une fois, à vie",
    features: [
      "Tout du plan Mois",
      "Aucune limite mensuelle",
      "Accès anticipé aux nouveautés",
      "Mises à jour à vie",
      "Support prioritaire",
      "Une heure de coaching candidature incluse",
    ],
    cta: "Prendre à vie",
  },
];

export function Pricing() {
  const reduce = useReducedMotion();
  return (
    <section
      id="pricing"
      className="bg-cream py-28 md:py-40 px-6 md:px-10"
      aria-label="Tarifs Cheatjob"
    >
      <div className="mx-auto max-w-[1200px] flex flex-col gap-14 md:gap-20">
        <div className="flex flex-col gap-6">
          <Eyebrow>Tarifs</Eyebrow>
          <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink max-w-[20ch]">
            Le prix d&apos;une soirée.{" "}
            <span className="italic">Le contrat d&apos;une année.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.6,
                delay: reduce ? 0 : i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "relative bg-white border border-border-subtle rounded-[12px] p-8 md:p-10 flex flex-col",
                plan.featured && "border-burgundy border-t-[3px]"
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-burgundy text-cream text-[10px] uppercase tracking-[0.22em] font-sans font-semibold px-4 py-1 rounded-sm">
                  Populaire
                </span>
              )}

              <div className="flex flex-col gap-2 mb-8">
                <h3 className="text-[11px] uppercase tracking-[0.22em] font-sans font-semibold text-muted">
                  {plan.name}
                </h3>
                <p className="text-[14px] text-muted font-sans">
                  {plan.subtitle}
                </p>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-serif text-[64px] leading-none text-ink tabular-nums">
                  {plan.price}
                </span>
              </div>
              <p className="text-[13px] text-muted font-sans mb-10">
                {plan.priceSub}
              </p>

              <ul className="flex flex-col gap-3 font-sans text-[14px] text-ink mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check
                      className="size-4 text-burgundy shrink-0 mt-0.5"
                      strokeWidth={2.2}
                      aria-hidden
                    />
                    <span className="leading-[1.5]">{f}</span>
                  </li>
                ))}
              </ul>

              {(() => {
                const href = LINKS[plan.id];
                const onClick = () => {
                  posthog.capture("pricing_cta_click", {
                    plan: plan.id,
                    has_link: Boolean(href),
                  });
                };
                const className = cn(
                  "w-full h-12 rounded-[10px] text-[14px] font-semibold font-sans transition-colors inline-flex items-center justify-center",
                  plan.featured
                    ? "bg-burgundy text-cream hover:bg-burgundy-deep"
                    : "border border-burgundy text-burgundy hover:bg-burgundy/5",
                  !href && "opacity-60 cursor-not-allowed"
                );
                return href ? (
                  <a
                    href={href}
                    onClick={onClick}
                    className={className}
                    rel="noopener"
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button type="button" disabled className={className}>
                    Bientôt disponible
                  </button>
                );
              })()}

              <p className="mt-3 text-center font-sans text-[11px] uppercase tracking-[0.22em] text-muted-soft">
                Pré-commande · {DELIVERY_LABEL}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="text-center font-sans text-[13px] text-muted max-w-[58ch] mx-auto leading-[1.6]">
          Paiement sécurisé par Stripe. Facturation en euros, TVA incluse.
          Pré-commande avec livraison estimée en juin 2026 — remboursement
          intégral si le produit n&apos;est pas livré à cette date.
        </p>
      </div>
    </section>
  );
}
