"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

/**
 * Small fade-out scroll hint at the bottom of the hero.
 * Disappears as the user starts scrolling.
 */
export function ScrollHint() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 120], [1, 0]);
  const y = useTransform(scrollY, [0, 120], [0, 10]);

  if (reduce) return null;

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
      aria-hidden
    >
      <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-medium text-cream/55">
        scroll
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="size-4 text-cream/55" strokeWidth={1.5} aria-hidden />
      </motion.div>
    </motion.div>
  );
}
