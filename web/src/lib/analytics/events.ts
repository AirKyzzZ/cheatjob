"use client";

import posthog from "posthog-js";

export const EVENTS = {
  ScrollDepth: "scroll_depth",
  SectionViewed: "section_viewed",
  TimeOnPageBucket: "time_on_page_bucket",
  ExitIntent: "exit_intent",

  HeroPrimaryCta: "hero_primary_cta",
  HeroSecondaryCta: "hero_secondary_cta",

  NavLinkClick: "nav_link_click",

  EvidenceCardHover: "evidence_card_hover",

  PricingPlanHover: "pricing_plan_hover",
  PricingCtaClick: "pricing_cta_click",

  FaqExpanded: "faq_expanded",

  FinalCtaClick: "final_cta_click",

  WaitlistOpened: "waitlist_opened",
  WaitlistSubmitted: "waitlist_submitted",
  WaitlistError: "waitlist_error",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export function track(event: EventName, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, props);
}

export function identify(
  distinctId: string,
  traits?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.identify(distinctId, traits);
}

export function setPersonProps(traits: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.setPersonProperties(traits);
}
