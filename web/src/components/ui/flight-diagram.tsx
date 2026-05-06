"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { RotateCw } from "lucide-react";

/**
 * FlightDiagram — interactive editorial motion graphic.
 *
 *  A letter takes off from the user's CV (left), traces a confident arc
 *  *over* the ATS/HR trash bin (middle, containing logo marks for the
 *  rejected paths: Indeed / LinkedIn / Welcome to the Jungle), and lands
 *  in the manager's inbox (right). Replays on tap of the "Rejouer" CTA
 *  or whenever the section re-enters the viewport.
 *
 *  Pure SVG + Framer Motion. No 3D, no Lottie — keeps the file < 6 KB
 *  rendered, scales infinitely, brand-faithful (burgundy + ink + cream
 *  only). Logos are simplified wordmarks rendered in muted gray inside
 *  the trash, so the "dead path" reads at a glance.
 */
export function FlightDiagram() {
  const t = useTranslations("handoff");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: false, margin: "-15%" });
  const [runId, setRunId] = useState(0);

  // Replay whenever the section re-enters the viewport, plus on click.
  useEffect(() => {
    if (inView) setRunId((id) => id + 1);
  }, [inView]);

  // The bypass arc — a quadratic Bézier from CV to manager, peaking
  // *above* the trash bin so the letter visibly skips it.
  const PATH = "M 110 220 Q 600 20 1090 220";

  return (
    <div ref={sectionRef} className="relative w-full max-w-[1180px] mx-auto">
      <svg
        viewBox="0 0 1200 360"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle ink shadow for the inbox highlight */}
          <radialGradient id="fd-inbox-glow">
            <stop offset="0%" stopColor="#6B1F28" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6B1F28" stopOpacity="0" />
          </radialGradient>
          {/* Letter envelope — reusable */}
          <symbol id="fd-letter" viewBox="-22 -16 44 32">
            <rect
              x="-20"
              y="-14"
              width="40"
              height="28"
              rx="3"
              fill="#FAF9F6"
              stroke="#6B1F28"
              strokeWidth="1.5"
            />
            <path
              d="M -20 -14 L 0 4 L 20 -14"
              fill="none"
              stroke="#6B1F28"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </symbol>
        </defs>

        {/* Inbox glow underneath (right station) */}
        <circle cx="1090" cy="220" r="100" fill="url(#fd-inbox-glow)" />

        {/* Bypass arc — drawn animated stroke on view */}
        <motion.path
          d={PATH}
          fill="none"
          stroke="#6B1F28"
          strokeWidth="1.6"
          strokeDasharray="5 6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 0.55 } : {}}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Dead path — straight line through the trash, with strikethrough */}
        <line
          x1="170"
          y1="220"
          x2="1030"
          y2="220"
          stroke="#CFCBC2"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <line
          x1="540"
          y1="200"
          x2="660"
          y2="240"
          stroke="#9A9A9A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="540"
          y1="240"
          x2="660"
          y2="200"
          stroke="#9A9A9A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <text
          x="600"
          y="285"
          textAnchor="middle"
          fontFamily="Geist, sans-serif"
          fontSize="9"
          letterSpacing="2.4"
          fill="#9A9A9A"
        >
          {t("deadPath").toUpperCase()}
        </text>

        {/* Station 1 — CV (left) */}
        <g transform="translate(110, 220)">
          <motion.g
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <rect
              x="-26"
              y="-36"
              width="52"
              height="68"
              rx="3"
              fill="#FAF9F6"
              stroke="#0A0A0A"
              strokeWidth="1.6"
            />
            <line x1="-15" y1="-20" x2="15" y2="-20" stroke="#0A0A0A" strokeWidth="1.2" />
            <line x1="-15" y1="-10" x2="15" y2="-10" stroke="#0A0A0A" strokeWidth="1.2" />
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#0A0A0A" strokeWidth="1.2" />
            <line x1="-15" y1="10" x2="6" y2="10" stroke="#0A0A0A" strokeWidth="1.2" />
            <line x1="-15" y1="20" x2="12" y2="20" stroke="#0A0A0A" strokeWidth="1.2" />
            <text
              x="0"
              y="58"
              textAnchor="middle"
              fontFamily="Geist, sans-serif"
              fontSize="11"
              fontWeight="600"
              letterSpacing="2.6"
              fill="#0A0A0A"
            >
              {t("stationCv").toUpperCase()}
            </text>
          </motion.g>
        </g>

        {/* Station 2 — Trash bin with platform logos (center) */}
        <g transform="translate(600, 220)">
          <motion.g
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 0.85, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {/* Bin body — trapezoid */}
            <path
              d="M -52 -20 L 52 -20 L 44 44 L -44 44 Z"
              fill="#F4F3F1"
              stroke="#CFCBC2"
              strokeWidth="1.4"
            />
            {/* Bin lid */}
            <rect
              x="-58"
              y="-26"
              width="116"
              height="8"
              rx="1.5"
              fill="#E8E6E1"
              stroke="#CFCBC2"
              strokeWidth="1.2"
            />
            {/* Bin handle */}
            <rect x="-8" y="-32" width="16" height="6" rx="1" fill="#CFCBC2" />
            {/* Vertical ridges on bin */}
            <line x1="-30" y1="-12" x2="-30" y2="36" stroke="#CFCBC2" strokeWidth="0.8" />
            <line x1="-12" y1="-12" x2="-12" y2="36" stroke="#CFCBC2" strokeWidth="0.8" />
            <line x1="6" y1="-12" x2="6" y2="36" stroke="#CFCBC2" strokeWidth="0.8" />
            <line x1="24" y1="-12" x2="24" y2="36" stroke="#CFCBC2" strokeWidth="0.8" />

            {/* Logos peeking out — Indeed, LinkedIn, WTTJ */}
            <g transform="translate(-26, -2)">
              <rect x="-12" y="-9" width="24" height="14" rx="2" fill="#FFFFFF" />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontFamily="Geist, sans-serif"
                fontSize="9"
                fontWeight="700"
                fill="#9CA3AF"
                fontStyle="italic"
              >
                indeed
              </text>
            </g>
            <g transform="translate(2, 6)">
              <rect x="-10" y="-9" width="20" height="14" rx="2" fill="#FFFFFF" />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontFamily="Geist, sans-serif"
                fontSize="9"
                fontWeight="700"
                fill="#9CA3AF"
              >
                in
              </text>
            </g>
            <g transform="translate(28, 0)">
              <rect x="-12" y="-9" width="24" height="14" rx="2" fill="#FFFFFF" />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontFamily="Geist, sans-serif"
                fontSize="8"
                fontWeight="700"
                fill="#9CA3AF"
              >
                WTTJ
              </text>
            </g>

            {/* Label */}
            <text
              x="0"
              y="78"
              textAnchor="middle"
              fontFamily="Geist, sans-serif"
              fontSize="11"
              fontWeight="600"
              letterSpacing="2.6"
              fill="#9A9A9A"
            >
              {t("stationTrash").toUpperCase()}
            </text>
          </motion.g>
        </g>

        {/* Station 3 — Manager inbox (right) */}
        <g transform="translate(1090, 220)">
          <motion.g
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Inbox tray */}
            <rect
              x="-44"
              y="-30"
              width="88"
              height="60"
              rx="4"
              fill="#FAF9F6"
              stroke="#6B1F28"
              strokeWidth="1.8"
            />
            {/* Open envelope flap (suggesting received) */}
            <path
              d="M -44 -30 L 0 6 L 44 -30"
              fill="none"
              stroke="#6B1F28"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Pulsing dot — incoming */}
            <motion.circle
              cx="32"
              cy="-22"
              r="3.5"
              fill="#6B1F28"
              animate={
                reduce
                  ? {}
                  : { opacity: [0.4, 1, 0.4], scale: [0.8, 1.15, 0.8] }
              }
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <text
              x="0"
              y="56"
              textAnchor="middle"
              fontFamily="Geist, sans-serif"
              fontSize="11"
              fontWeight="700"
              letterSpacing="2.6"
              fill="#6B1F28"
            >
              {t("stationManager").toUpperCase()}
            </text>
          </motion.g>
        </g>

        {/* Animated letter — flies along the bypass arc. CSS offset-path
            is the cleanest way to follow an SVG path natively. Keyed on
            runId so the animation re-mounts on replay. */}
        <motion.g
          key={runId}
          initial={
            reduce
              ? { offsetDistance: "100%" }
              : { offsetDistance: "0%", opacity: 0 }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { offsetDistance: "100%", opacity: [0, 1, 1, 1, 0] }
          }
          transition={{
            duration: 3.4,
            ease: [0.45, 0.05, 0.55, 0.95],
            times: [0, 0.08, 0.5, 0.92, 1],
          }}
          style={
            {
              offsetPath: `path("${PATH}")`,
              offsetDistance: "0%",
              offsetRotate: "auto",
            } as React.CSSProperties
          }
        >
          <use href="#fd-letter" />
        </motion.g>
      </svg>

      {/* Replay control */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setRunId((id) => id + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-cream-soft px-4 py-2 text-[12px] font-sans font-medium text-muted hover:text-ink hover:border-border-strong transition-colors"
        >
          <RotateCw className="size-3.5" strokeWidth={1.6} aria-hidden />
          {t("replay")}
        </button>
      </div>
    </div>
  );
}
