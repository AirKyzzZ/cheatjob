"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { EVENTS, track } from "@/lib/analytics/events";

const SECONDARY_LINKS = [
  { label: "Comment ça marche", href: "#wedge", id: "wedge" },
  { label: "Preuves", href: "#evidence", id: "evidence" },
  { label: "FAQ", href: "#faq", id: "faq" },
] as const;

export function Nav() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const bg = useTransform(
    scrollY,
    [0, 600],
    ["rgba(250, 249, 246, 0)", "rgba(250, 249, 246, 0.96)"]
  );
  const border = useTransform(
    scrollY,
    [0, 600],
    ["rgba(255, 255, 255, 0.14)", "rgba(232, 230, 225, 1)"]
  );
  const wordmarkColor = useTransform(scrollY, [0, 600], ["#faf9f6", "#6b1f28"]);
  const linkColor = useTransform(
    scrollY,
    [0, 600],
    ["rgba(250, 249, 246, 0.8)", "#0a0a0a"]
  );
  const ctaBg = useTransform(scrollY, [0, 600], ["#faf9f6", "#6b1f28"]);
  const ctaFg = useTransform(scrollY, [0, 600], ["#0a0a0a", "#faf9f6"]);
  const glassBlur = useTransform(scrollY, [0, 600], ["blur(18px)", "blur(12px)"]);
  const glassSaturate = useTransform(
    scrollY,
    [0, 600],
    ["saturate(160%)", "saturate(110%)"]
  );
  const backdropFilter = useTransform(
    [glassBlur, glassSaturate],
    ([b, s]: string[]) => `${b} ${s}`
  );

  return (
    <motion.header
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1120px]"
    >
      <motion.div
        style={{
          backgroundColor: bg,
          borderColor: border,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.25)",
        }}
        className="rounded-full h-14 flex items-center justify-between px-5 md:px-6 border"
      >
        <a
          href="#top"
          aria-label="Cheatjob — retour en haut"
          onClick={() => track(EVENTS.NavLinkClick, { target: "top" })}
          className="flex items-baseline font-serif"
        >
          <motion.span
            style={{ color: wordmarkColor }}
            className="font-serif text-[22px] leading-none tracking-[-0.01em]"
          >
            cheatjob
          </motion.span>
        </a>

        <nav className="flex items-center gap-1 lg:gap-2">
          <div className="hidden lg:flex items-center gap-1 pr-2">
            {SECONDARY_LINKS.map((link) => (
              <motion.a
                key={link.id}
                href={link.href}
                onClick={() =>
                  track(EVENTS.NavLinkClick, { target: link.id, source: "link" })
                }
                style={{ color: linkColor }}
                className="text-[13px] font-medium hover:opacity-80 transition-opacity px-3 py-1.5 rounded-full font-sans"
              >
                {link.label}
              </motion.a>
            ))}
          </div>
          <motion.a
            href="#pricing"
            onClick={() =>
              track(EVENTS.NavLinkClick, { target: "pricing", source: "link" })
            }
            style={{ color: linkColor }}
            className="hidden md:inline-block text-[13px] font-medium hover:opacity-80 transition-opacity px-3 py-1.5 font-sans"
          >
            Tarifs
          </motion.a>
          <motion.a
            href="#pricing"
            onClick={() =>
              track(EVENTS.NavLinkClick, { target: "pricing", source: "cta" })
            }
            style={{ backgroundColor: ctaBg, color: ctaFg }}
            className="inline-flex items-center h-10 px-4 md:px-5 rounded-full text-[13px] font-semibold font-sans hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Commencer
          </motion.a>
        </nav>
      </motion.div>
    </motion.header>
  );
}
