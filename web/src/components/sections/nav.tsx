"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

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
  const textColor = useTransform(scrollY, [0, 600], ["#faf9f6", "#0a0a0a"]);
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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[960px]"
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
          className="flex items-center gap-2.5 font-serif"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={28}
            height={28}
            priority
            className="size-7 rounded-full object-cover shrink-0"
          />
          <motion.span
            style={{ color: textColor }}
            className="text-[18px] font-normal tracking-tight leading-none"
          >
            cheatjob
          </motion.span>
        </a>

        <nav className="flex items-center gap-2 md:gap-4">
          <motion.a
            href="#pricing"
            style={{ color: linkColor }}
            className="hidden md:inline-block text-[13px] font-medium hover:opacity-80 transition-opacity px-2 py-1 font-sans"
          >
            Tarifs
          </motion.a>
          <motion.a
            href="#pricing"
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
