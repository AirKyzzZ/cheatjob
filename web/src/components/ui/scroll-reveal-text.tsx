"use client";

import { useRef, type ElementType } from "react";
import { motion, useScroll, useTransform } from "motion/react";

type ScrollOffset = ["start 0.85", "end 0.4"] | [string, string];

type Props = {
  children: string;
  className?: string;
  /** Element type — `p` (default) or `span` when used inline. */
  as?: "p" | "span" | "div";
  /** Color words fade FROM (muted) — default 0.18. */
  fromOpacity?: number;
  /** Color words fade TO — default 1. */
  toOpacity?: number;
  /** Scroll offset window for the reveal — see motion.dev/useScroll. */
  offset?: ScrollOffset;
};

/**
 * Scroll-driven per-word opacity reveal. As the paragraph enters the
 * viewport, words light up sequentially from muted to full intensity
 * along scroll progress.
 *
 * Editorial rhythm: makes long-form prose feel narrated rather than
 * dropped at the reader. Used in the founder + pull-quote moments.
 */
export function ScrollRevealText({
  children,
  className = "",
  as = "p",
  fromOpacity = 0.18,
  toOpacity = 1,
  offset = ["start 0.85", "end 0.4"],
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref as React.RefObject<HTMLElement>,
    // motion's offset is typed as a string-tuple; cast keeps the
    // `ScrollOffset` shape narrow at the call site.
    offset: offset as unknown as ["start 0.85", "end 0.4"],
  });

  const words = children.split(" ");
  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={`relative ${className}`}
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return (
          <Word
            key={`${word}-${i}`}
            scrollYProgress={scrollYProgress}
            range={[start, end]}
            fromOpacity={fromOpacity}
            toOpacity={toOpacity}
          >
            {word}
          </Word>
        );
      })}
    </Tag>
  );
}

type WordProps = {
  children: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  fromOpacity: number;
  toOpacity: number;
};

function Word({ children, scrollYProgress, range, fromOpacity, toOpacity }: WordProps) {
  const opacity = useTransform(scrollYProgress, range, [fromOpacity, toOpacity]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em]">
      {children}
    </motion.span>
  );
}
