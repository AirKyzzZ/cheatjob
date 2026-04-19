"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type BlurTextProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  italic?: boolean;
  stagger?: number;
  delay?: number;
  duration?: number;
  triggerOnLoad?: boolean;
};

export function BlurText({
  text,
  className,
  as: Tag = "span",
  italic = false,
  stagger = 0.085,
  delay = 0,
  duration = 0.7,
  triggerOnLoad = false,
}: BlurTextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const shouldPlay = triggerOnLoad || inView;

  if (reduce) {
    return (
      <Tag ref={ref as never} className={cn(italic && "italic", className)}>
        {text}
      </Tag>
    );
  }

  const words = text.split(" ");

  return (
    <Tag
      ref={ref as never}
      className={cn(italic && "italic", className)}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          initial={{ filter: "blur(14px)", opacity: 0, y: 18 }}
          animate={
            shouldPlay
              ? { filter: "blur(0px)", opacity: 1, y: 0 }
              : { filter: "blur(14px)", opacity: 0, y: 18 }
          }
          transition={{
            duration,
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-hidden="true"
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
