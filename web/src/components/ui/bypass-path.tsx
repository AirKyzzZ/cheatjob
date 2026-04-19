"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

type BypassPathProps = {
  variant?: "horizontal" | "diagonal";
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Signature "network bypass" path — thin burgundy line that crosses out
 * the ATS funnel and reroutes to the direct inbox. Path-draws on scroll.
 * Used as an ownable visual motif throughout the page.
 */
export function BypassPath({
  variant = "horizontal",
  tone = "light",
  className,
}: BypassPathProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();

  const labelColor = tone === "dark" ? "rgba(250,249,246,0.55)" : "#6b6b6b";
  const cancelColor = tone === "dark" ? "rgba(250,249,246,0.22)" : "#cfcbc2";
  const routeColor = "#6b1f28";

  if (variant === "horizontal") {
    return (
      <svg
        ref={ref}
        viewBox="0 0 900 120"
        role="img"
        aria-label="Contournement des RH et des ATS vers la boîte directe du manager"
        className={className}
      >
        {/* Stop labels */}
        <g fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight={500} letterSpacing="0.18em">
          <text x="10" y="72" fill={labelColor} textAnchor="start">
            TON CV
          </text>
          <text x="300" y="72" fill={labelColor} textAnchor="middle">
            ATS
          </text>
          <text x="520" y="72" fill={labelColor} textAnchor="middle">
            BOÎTE RH
          </text>
          <text x="890" y="72" fill={routeColor} textAnchor="end" fontWeight={700}>
            MANAGER
          </text>
        </g>

        {/* Original funnel path (crossed out) */}
        <motion.line
          x1="60"
          y1="60"
          x2="590"
          y2="60"
          stroke={cancelColor}
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={inView || reduce ? { pathLength: 1 } : {}}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Cross-outs over ATS + RH */}
        <motion.g
          initial={reduce ? undefined : { opacity: 0 }}
          animate={inView || reduce ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.9 }}
          stroke={cancelColor}
          strokeWidth="1"
          strokeLinecap="round"
        >
          <line x1="282" y1="50" x2="318" y2="70" />
          <line x1="318" y1="50" x2="282" y2="70" />
          <line x1="502" y1="50" x2="538" y2="70" />
          <line x1="538" y1="50" x2="502" y2="70" />
        </motion.g>

        {/* Nodes */}
        <circle cx="60" cy="60" r="3" fill={routeColor} />
        <circle cx="300" cy="60" r="3" fill={cancelColor} />
        <circle cx="520" cy="60" r="3" fill={cancelColor} />

        {/* Bypass route — curves above, lands on manager */}
        <motion.path
          d="M 60 60 C 200 -10, 740 -10, 840 60"
          fill="none"
          stroke={routeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={inView || reduce ? { pathLength: 1 } : {}}
          transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Terminal node — manager */}
        <motion.circle
          cx="840"
          cy="60"
          r="5"
          fill={routeColor}
          initial={reduce ? undefined : { scale: 0, opacity: 0 }}
          animate={inView || reduce ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    );
  }

  // Diagonal minimal variant
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 60"
      role="img"
      aria-label="Route Cheatjob"
      className={className}
    >
      <motion.path
        d="M 10 50 Q 200 -20, 390 50"
        fill="none"
        stroke={routeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={reduce ? undefined : { pathLength: 0 }}
        animate={inView || reduce ? { pathLength: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <circle cx="10" cy="50" r="3" fill={routeColor} />
      <circle cx="390" cy="50" r="3" fill={routeColor} />
    </svg>
  );
}
