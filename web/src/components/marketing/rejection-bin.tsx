"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useSectionViewed } from "@/hooks/use-section-viewed";

// Single source of truth — one row per platform, position included.
// Coordinates are pixel offsets from the bin-rim CENTER, with positive
// y pointing DOWN into the bin interior. The list is ordered top→bottom
// so the cascade animation lands them naturally (papers thrown in
// settle deeper than papers thrown last).
type Platform = {
  src: string;
  alt: string;
  rounded?: boolean;
  x: number;
  y: number;
  rotate: number;
};

// y values are tuned so every logo's top edge clears the rim ellipse
// (which extends ~20px below the rim centerline) — no logo should
// overlap the dark rim band or the lid.
const PLATFORMS: Platform[] = [
  { src: "/logos/64917c35f83116b982484b53_thumb-indeed.webp", alt: "Indeed", x: -90, y: 54, rotate: 16 },
  { src: "/logos/linkedin-icon-2.svg", alt: "LinkedIn", x: 6, y: 56, rotate: -22 },
  {
    src: "/logos/idjhOEE_Y5_1778089263490.jpeg",
    alt: "Welcome to the Jungle",
    rounded: true,
    x: 88, y: 62, rotate: 14,
  },
  { src: "/logos/leboncoin-fr-5147f9a5.png", alt: "Leboncoin", x: -48, y: 102, rotate: -8 },
  { src: "/logos/LOGO_HelloWork_Activités.png", alt: "HelloWork", x: 64, y: 122, rotate: 20 },
  { src: "/logos/LOGO-METEOJOB_OCTOBRE_2015.png.webp", alt: "Meteojob", x: -22, y: 162, rotate: 4 },
  { src: "/logos/IUAVUXEGGRN6ZLZDLW5PKI5K6Y.png.avif", alt: "France Travail", x: 60, y: 188, rotate: -14 },
];

const LOGO_SIZE = 56; // px — sized to fit cleanly inside the tapered bin interior
const STAGGER_MS = 110;
const DROP_MS = 650;

type Step = "initial" | "open" | "falling" | "shut";

export function RejectionBin() {
  const t = useTranslations("rejectionBin");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("rejection_bin", sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream py-24 md:py-32 px-6 md:px-10 border-y border-border-subtle overflow-hidden"
      aria-label={t("eyebrow")}
    >
      <div className="mx-auto max-w-[1100px] flex flex-col items-center text-center gap-12">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.5 }}
          className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.32em] text-muted"
        >
          {t("eyebrow")}
        </motion.span>

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-ink leading-[1] tracking-[-0.03em] max-w-[20ch]"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          {t("headline")}
        </motion.h2>

        <BinScene reduce={!!reduce} />

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-sans italic text-[13px] md:text-[14px] text-muted leading-relaxed max-w-[58ch]"
        >
          {t("caption")}
        </motion.p>
      </div>
    </section>
  );
}

/**
 * BinScene — interactive bin + scroll-triggered choreography.
 *
 *   initial → open: lid floats above bin (entrance)
 *   open → falling: papers cascade from above into the rim, staggered
 *   falling → shut: lid drops askew onto the overflowing pile, bin recoils
 *
 * Mouse-move within the scene tilts the whole composition in 3D.
 */
function BinScene({ reduce }: { reduce: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sceneRef, { once: true, amount: 0.45 });
  const [step, setStep] = useState<Step>("initial");

  // Mouse parallax — subtle.
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotY = useTransform(useSpring(mvX, { stiffness: 80, damping: 18 }), [-1, 1], [-7, 7]);
  const rotX = useTransform(useSpring(mvY, { stiffness: 80, damping: 18 }), [-1, 1], [4, -4]);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setStep("shut");
      return;
    }
    setStep("open");
    const armed = setTimeout(() => setStep("falling"), 350);
    const allLanded = 350 + PLATFORMS.length * STAGGER_MS + DROP_MS;
    const slam = setTimeout(() => setStep("shut"), allLanded);
    return () => {
      clearTimeout(armed);
      clearTimeout(slam);
    };
  }, [inView, reduce]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mvX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mvY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  }

  function handleMouseLeave() {
    mvX.set(0);
    mvY.set(0);
  }

  return (
    <div
      ref={sceneRef}
      className="relative"
      style={{ perspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative"
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        animate={
          step === "shut" && !reduce
            ? { x: [0, -3, 4, -2, 0], y: [0, 2, -1, 1, 0] }
            : undefined
        }
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        {/* aspectRatio kept in sync with the BinBody viewBox below so the
            illustration scales without distortion. */}
        <div
          className="relative w-[320px] sm:w-[380px] md:w-[440px]"
          style={{ aspectRatio: "400 / 420" }}
        >
          <GroundShadow />
          <BinBody />
          {/* Logos render AFTER the body so they paint over its front
              face — visually "inside" the bin without being occluded —
              but BEFORE the lid so the lid sits on top once it slams. */}
          {PLATFORMS.map((platform, index) => (
            <FallingLogo
              key={platform.alt}
              platform={platform}
              index={index}
              step={step}
              reduce={reduce}
            />
          ))}
          <BinLid step={step} reduce={reduce} />
        </div>
      </motion.div>
    </div>
  );
}

function GroundShadow() {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 -translate-x-1/2 bottom-[-2%] w-[78%] h-[6%]"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0) 70%)",
        filter: "blur(2px)",
      }}
    />
  );
}

/** Cylindrical can with rim ellipse, ridges, REJECT stamp. */
function BinBody() {
  return (
    <svg
      viewBox="0 0 400 420"
      className="absolute inset-0 w-full h-full"
      style={{ filter: "drop-shadow(0 10px 24px rgba(10,10,10,0.06))" }}
    >
      <defs>
        <linearGradient id="bin-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FAF9F6" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0EEE7" />
        </linearGradient>
        <linearGradient id="bin-rim-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8E4DA" />
          <stop offset="100%" stopColor="#FAF9F6" />
        </linearGradient>
      </defs>

      <path
        d="M 78 90
           C 78 85, 88 82, 200 82
           C 312 82, 322 85, 322 90
           L 302 380
           C 301 390, 280 394, 200 394
           C 120 394, 99 390, 98 380
           Z"
        fill="url(#bin-shade)"
        stroke="#0A0A0A"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      <ellipse
        cx="200"
        cy="383"
        rx="102"
        ry="11"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="1.5"
        opacity="0.4"
      />

      <path d="M 130 105 L 124 375" stroke="#0A0A0A" strokeWidth="1.3" opacity="0.45" fill="none" />
      <path d="M 200 105 L 200 375" stroke="#0A0A0A" strokeWidth="1.3" opacity="0.45" fill="none" />
      <path d="M 270 105 L 276 375" stroke="#0A0A0A" strokeWidth="1.3" opacity="0.45" fill="none" />

      {/* Top rim — ellipse "mouth" */}
      <ellipse
        cx="200"
        cy="90"
        rx="122"
        ry="18"
        fill="url(#bin-rim-shade)"
        stroke="#0A0A0A"
        strokeWidth="2.6"
      />
      <ellipse cx="200" cy="92" rx="108" ry="14" fill="#1A1A1A" opacity="0.85" />
      <ellipse
        cx="200"
        cy="90"
        rx="108"
        ry="14"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="1.6"
      />

      {/* Burgundy REJECT stamp — anchored low and centered-right inside
          the bin body (the can tapers inward, so we bias toward center
          to avoid overflowing past the right wall). */}
      <g transform="translate(244, 312) rotate(-12)">
        <rect
          x="-44"
          y="-14"
          width="88"
          height="28"
          rx="2"
          fill="none"
          stroke="#6B1F28"
          strokeWidth="2"
        />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fontFamily="Geist, sans-serif"
          fontSize="14"
          fontWeight="700"
          letterSpacing="2"
          fill="#6B1F28"
        >
          REJECT
        </text>
      </g>
    </svg>
  );
}

/** Lid — separate motion element so we can choreograph the slam. */
function BinLid({ step, reduce }: { step: Step; reduce: boolean }) {
  // Y values are tuned so the lid plate (at lid-viewBox cy=40) rests on
  // the bin rim (at body-viewBox cy=90) once shut. All other states sit
  // progressively higher above the rim.
  const variants = {
    initial: { rotate: -44, y: -78, x: -10, opacity: 0 },
    open: { rotate: -28, y: -52, x: -4, opacity: 1 },
    falling: { rotate: -22, y: -56, x: -2, opacity: 1 },
    shut: { rotate: -8, y: 28, x: 0, opacity: 1 },
  } satisfies Record<Step, object>;

  return (
    <motion.svg
      viewBox="0 0 400 70"
      className="absolute inset-x-0 top-0 w-full pointer-events-none"
      style={{ originX: 0.5, originY: 1, zIndex: 4 }}
      initial="initial"
      animate={reduce ? "shut" : step}
      variants={variants}
      transition={
        step === "shut"
          ? { duration: 0.32, ease: [0.7, 0, 0.84, 0] }
          : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <defs>
        <linearGradient id="lid-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAF9F6" />
          <stop offset="100%" stopColor="#E8E4DA" />
        </linearGradient>
      </defs>
      <ellipse
        cx="200"
        cy="40"
        rx="132"
        ry="14"
        fill="url(#lid-shade)"
        stroke="#0A0A0A"
        strokeWidth="2.6"
      />
      <path
        d="M 68 40 L 72 54 C 90 60, 310 60, 328 54 L 332 40"
        fill="#E8E4DA"
        stroke="#0A0A0A"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Handle */}
      <line x1="186" y1="20" x2="214" y2="20" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
      <line x1="186" y1="20" x2="186" y2="34" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
      <line x1="214" y1="20" x2="214" y2="34" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="200" cy="38" rx="120" ry="6" fill="#FFFFFF" opacity="0.7" />
    </motion.svg>
  );
}

/** A single platform "paper" — falls into its fan slot. */
function FallingLogo({
  platform,
  index,
  step,
  reduce,
}: {
  platform: Platform;
  index: number;
  step: Step;
  reduce: boolean;
}) {
  const entryDriftX = (index % 2 === 0 ? -1 : 1) * (24 + (index % 3) * 12);

  const variants = {
    initial: { x: platform.x + entryDriftX, y: -260, rotate: 0, opacity: 0, scale: 0.95 },
    open: { x: platform.x + entryDriftX, y: -260, rotate: 0, opacity: 0, scale: 0.95 },
    falling: { x: platform.x, y: platform.y, rotate: platform.rotate, opacity: 1, scale: 1 },
    shut: { x: platform.x, y: platform.y, rotate: platform.rotate, opacity: 1, scale: 1 },
  } satisfies Record<Step, object>;

  return (
    <motion.div
      className="absolute"
      style={{
        left: "50%",
        // 21.4% of parent height ≈ rim centerline (90/420 of the body
        // viewBox). Logo offsets in PLATFORMS are measured from this anchor.
        top: "21.4%",
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        marginLeft: -LOGO_SIZE / 2,
        marginTop: -LOGO_SIZE / 2,
        transformOrigin: "50% 50%",
      }}
      initial="initial"
      animate={reduce ? "shut" : step}
      variants={variants}
      transition={{
        duration: DROP_MS / 1000,
        delay: step === "falling" ? (index * STAGGER_MS) / 1000 : 0,
        ease: [0.34, 1.18, 0.64, 1],
      }}
      whileHover={
        reduce
          ? undefined
          : {
              y: platform.y - 14,
              rotate: platform.rotate - 5,
              scale: 1.06,
              transition: { type: "spring", stiffness: 260, damping: 18 },
            }
      }
    >
      <div
        className={`relative w-full h-full bg-white shadow-[0_6px_18px_rgba(10,10,10,0.12)] border border-border-subtle overflow-hidden p-2 grid place-items-center ${
          platform.rounded ? "rounded-xl" : "rounded-md"
        }`}
      >
        <Image
          src={platform.src}
          alt={platform.alt}
          width={LOGO_SIZE * 2}
          height={LOGO_SIZE * 2}
          unoptimized
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* Burgundy X — fades in once the lid has shut */}
        <motion.svg
          aria-hidden
          viewBox="0 0 24 24"
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: step === "shut" ? 0.35 : 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <line x1="4" y1="4" x2="20" y2="20" stroke="#6B1F28" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="4" x2="4" y2="20" stroke="#6B1F28" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
      </div>
    </motion.div>
  );
}
