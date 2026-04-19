"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  useInView,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

type Stage = "scanning" | "verifying" | "sealing" | "rest";

/**
 * ProofPanel — cinematic dossier card.
 *
 * Architecture (Codex spec):
 * - Outer wrapper: entry animation + card tilt (±6° / ±5°)
 * - InspectionLight: radial bloom that follows cursor on hover
 * - PlaneBack / PlaneMid / PlaneFront: parallax depth layers
 * - StatusCluster: in-view ambient loop (scanning → verifying → sealing → rest)
 * - DossierSeal: top-right marker with hover-lift reveal
 *
 * All ambient motion gated on `useReducedMotion`.
 */
export function ProofPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "-10%" });

  const [hovered, setHovered] = useState(false);
  const [stage, setStage] = useState<Stage>("scanning");

  // Cursor normalized to [-0.5, 0.5]
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Card-level tilt (spring)
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), {
    stiffness: 120,
    damping: 20,
  });

  // Three depth planes — slower spring for weighted feel
  const planeSpring = { stiffness: 110, damping: 18, mass: 0.7 };
  const backX = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), planeSpring);
  const backY = useSpring(useTransform(my, [-0.5, 0.5], [-4, 4]), planeSpring);
  const midX = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), planeSpring);
  const midY = useSpring(useTransform(my, [-0.5, 0.5], [-8, 8]), planeSpring);
  const frontX = useSpring(
    useTransform(mx, [-0.5, 0.5], [-14, 14]),
    planeSpring
  );
  const frontY = useSpring(
    useTransform(my, [-0.5, 0.5], [-10, 10]),
    planeSpring
  );

  // Inspection-light position (radial gradient center follows cursor)
  const lightXPct = useTransform(mx, [-0.5, 0.5], [22, 78]);
  const lightYPct = useTransform(my, [-0.5, 0.5], [30, 70]);
  const inspectionBg = useMotionTemplate`radial-gradient(circle at ${lightXPct}% ${lightYPct}%, rgba(250,249,246,0.10) 0%, rgba(250,249,246,0.04) 18%, transparent 42%)`;

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    if (reduce) return;
    mx.set(0);
    my.set(0);
    setHovered(false);
  };

  const onMouseEnter = () => {
    if (reduce) return;
    setHovered(true);
  };

  // Ambient stage loop — runs only in view, reduced-motion freezes on "rest"
  useEffect(() => {
    if (reduce || !inView) return;

    const durations: Record<Stage, number> = {
      scanning: 2200,
      verifying: 1400,
      sealing: 900,
      rest: 2600,
    };
    const next: Record<Stage, Stage> = {
      scanning: "verifying",
      verifying: "sealing",
      sealing: "rest",
      rest: "scanning",
    };
    const t = setTimeout(() => setStage(next[stage]), durations[stage]);
    return () => clearTimeout(t);
  }, [stage, inView, reduce]);

  return (
    <div className="relative w-full max-w-[440px]">
      {/* ── DossierSeal — hover-lift + provenance reveal ───────────── */}
      <motion.div
        className="absolute -top-3 right-6 z-20 flex flex-col items-end gap-1.5"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="text-[10px] uppercase tracking-[0.22em] font-sans font-semibold text-burgundy bg-cream px-2.5 py-1 rounded-sm cursor-help select-none"
          animate={
            hovered && !reduce
              ? { y: -3, rotate: -2 }
              : stage === "sealing" && !reduce && !hovered
                ? { y: 4, rotate: -3.5 }
                : { y: 0, rotate: 0 }
          }
          transition={{
            duration: hovered ? 0.24 : stage === "sealing" ? 0.55 : 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Dossier 04 / 19
        </motion.span>
        <motion.span
          className="pointer-events-none text-[9.5px] uppercase tracking-[0.2em] font-sans font-medium text-cream/65 bg-[#0a0a0a] border border-cream/10 px-2 py-1 rounded-sm whitespace-nowrap overflow-hidden"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={
            hovered && !reduce
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -4 }
          }
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          Source · offre + domaine
        </motion.span>
      </motion.div>

      {/* ── Card ───────────────────────────────────────────────────── */}
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        initial={reduce ? false : { x: 40, opacity: 0, rotateY: -8 }}
        animate={{ x: 0, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={
          reduce
            ? undefined
            : {
                rotateY,
                rotateX,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
              }
        }
        className="relative rounded-[8px] overflow-hidden bg-[#13110f] border border-cream/12 text-cream"
        aria-label="Exemple de résultat Cheatjob pour l'entreprise Qonto"
      >
        {/* Subpixel edge light — gives "machined" feel */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[8px]"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(250,249,246,0.06), inset 1px 0 0 rgba(250,249,246,0.03)",
          }}
          aria-hidden
        />

        {/* Verification spine — dossier tab / bound-document edge
            Thin burgundy rail just inside the left edge.
            Stage-linked luminance swell on 'verifying'. */}
        <motion.div
          className="absolute top-5 bottom-5 left-[7px] w-[2px] rounded-full pointer-events-none z-[4]"
          style={{
            background:
              "linear-gradient(180deg, rgba(107,31,40,0.35) 0%, rgba(107,31,40,0.85) 50%, rgba(107,31,40,0.35) 100%)",
          }}
          animate={
            reduce
              ? undefined
              : {
                  opacity:
                    stage === "verifying" ? 1 : stage === "scanning" ? 0.75 : 0.55,
                  boxShadow:
                    stage === "verifying"
                      ? "0 0 12px rgba(107,31,40,0.55)"
                      : "0 0 6px rgba(107,31,40,0.25)",
                }
          }
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />

        {/* ── PlaneBack: grain + scan sweep ──────────────────────── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={reduce ? undefined : { x: backX, y: backY }}
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
            }}
          />
          {!reduce && <div className="scan-sweep" aria-hidden />}
        </motion.div>

        {/* ── InspectionLight: cursor-follow bloom ───────────────── */}
        {!reduce && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: inspectionBg,
              filter: "blur(10px)",
              opacity: hovered ? 0.7 : 0,
            }}
            transition={{ duration: 0.2 }}
            aria-hidden
          />
        )}

        {/* ── PlaneMid: main content ─────────────────────────────── */}
        <motion.div
          className="relative z-[2]"
          style={reduce ? undefined : { x: midX, y: midY }}
        >
          {/* Header strip */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream/8">
            <div className="flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-burgundy" aria-hidden />
              <motion.span
                className="text-[10px] uppercase tracking-[0.22em] font-sans font-semibold"
                animate={{
                  color:
                    stage === "scanning"
                      ? "rgba(250,249,246,0.82)"
                      : "rgba(250,249,246,0.55)",
                }}
                transition={{ duration: 0.35 }}
              >
                Reconstruction vérifiée
              </motion.span>
            </div>
            <motion.span
              className="font-mono text-[10px] text-cream/45 tabular-nums"
              animate={{
                opacity: stage === "scanning" ? 1 : 0.45,
              }}
              transition={{ duration: 0.35 }}
            >
              {stage === "scanning" ? "00:00:09" : "00:00:10"}
            </motion.span>
          </div>

          {/* Company */}
          <div className="px-6 pt-6 pb-4 border-b border-cream/8">
            <div className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium text-cream/40 mb-2">
              Entreprise cible
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-serif text-[34px] leading-none text-cream">
                Qonto
              </span>
              <span className="font-mono text-[11px] text-cream/50">
                scale-up · Paris
              </span>
            </div>
          </div>

          {/* Contact — animated on stage transitions */}
          <div className="px-6 py-5 border-b border-cream/8 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium text-cream/40">
                Contact trouvé
              </div>
              <motion.span
                className="relative inline-flex text-[10px] uppercase tracking-[0.18em] font-sans font-semibold text-burgundy px-1.5 py-0.5 rounded-sm overflow-hidden"
                aria-label="Statut vérifié"
              >
                <span className="relative z-10">Vérifié</span>
                {/* Verify wash */}
                <motion.span
                  className="absolute inset-0 bg-burgundy/28 origin-left"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{
                    scaleX: stage === "verifying" ? [0, 1, 1] : 0,
                    opacity: stage === "verifying" ? [0, 1, 0.55] : 0,
                  }}
                  transition={{
                    duration: 1.4,
                    times: [0, 0.5, 1],
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  aria-hidden
                />
              </motion.span>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-serif text-[20px] text-cream leading-none">
                Thomas Dupuis
              </span>
            </div>
            <motion.div
              className="text-cream/60 font-mono text-[12px]"
              animate={{
                letterSpacing:
                  stage === "scanning" ? "0.04em" : "0.01em",
                color:
                  stage === "scanning"
                    ? "rgba(250,249,246,0.68)"
                    : "rgba(250,249,246,0.92)",
              }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              thomas.dupuis@qonto.eu
            </motion.div>
            <div className="text-[11px] font-sans text-cream/50 mt-1">
              Head of Growth
            </div>

            {/* Scanning underline traveling left→right */}
            <motion.span
              className="absolute bottom-0 left-6 right-6 h-[2px] bg-cream/80 origin-left rounded-full"
              style={{ boxShadow: "0 0 6px rgba(250,249,246,0.25)" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: stage === "scanning" ? [0, 1, 1] : 0,
                opacity: stage === "scanning" ? [0, 1, 0.35] : 0,
              }}
              transition={{
                duration: 2.2,
                times: [0, 0.5, 1],
                ease: "easeInOut",
              }}
              aria-hidden
            />
          </div>

          {/* Message */}
          <div className="px-6 py-5">
            <div className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium text-cream/40 mb-3">
              Message rédigé
            </div>
            <p className="font-serif italic text-[15px] leading-[1.55] text-cream/85 border-l border-burgundy pl-4">
              Bonjour Thomas, j&apos;ai vu l&apos;offre Growth chez Qonto.
              Avant le formulaire, je voulais te contacter directement pour
              savoir si...
            </p>
          </div>
        </motion.div>

        {/* ── PlaneFront: StatusCluster ──────────────────────────── */}
        <motion.div
          className="relative z-[3]"
          style={reduce ? undefined : { x: frontX, y: frontY }}
        >
          <div className="flex items-center justify-between px-6 py-3.5 bg-[#0e0c0b] border-t border-cream/8">
            <div className="flex items-center gap-2.5">
              <span className="verify-pulse" aria-hidden />
              <motion.span
                className="text-[11px] font-sans font-medium text-cream/75 tracking-wide"
                animate={{
                  y: stage === "verifying" ? [0, -0.5, 0] : 0,
                  opacity: stage === "verifying" ? [0.72, 0.88, 0.72] : 0.75,
                }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Prêt à envoyer
              </motion.span>
            </div>
            <span className="font-mono text-[10px] text-cream/40 tabular-nums">
              cheatjob · v1
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
