"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BlurText } from "@/components/ui/blur-text";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Terminal, CheckCircle2, Mail } from "lucide-react";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const MESSAGE_TEMPLATE =
  "Bonjour Thomas, je suis étudiant en M2 Marketing à Dauphine. J'ai vu l'offre d'alternance Growth ouverte chez Qonto. Avant de passer par le formulaire, je voulais te contacter directement pour savoir si...";

type Stage = "idle" | "company" | "email" | "message" | "done";

export function Wedge() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-20%", once: false });
  const reduce = useReducedMotion();
  useSectionViewed("wedge", sectionRef);
  const [stage, setStage] = useState<Stage>("idle");
  const [typed, setTyped] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStage("done");
      setTyped(MESSAGE_TEMPLATE);
      setCharIdx(MESSAGE_TEMPLATE.length);
      return;
    }
    if (!inView) return;
    if (stage === "idle") {
      const t = setTimeout(() => setStage("company"), 300);
      return () => clearTimeout(t);
    }
    if (stage === "company") {
      const t = setTimeout(() => setStage("email"), 1800);
      return () => clearTimeout(t);
    }
    if (stage === "email") {
      const t = setTimeout(() => setStage("message"), 1200);
      return () => clearTimeout(t);
    }
    if (stage === "message") {
      if (charIdx < MESSAGE_TEMPLATE.length) {
        const t = setTimeout(() => {
          setTyped(MESSAGE_TEMPLATE.slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        }, 22);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setStage("done"), 2000);
        return () => clearTimeout(t);
      }
    }
    // stage === "done" → stop. No restart loop.
  }, [stage, charIdx, inView, reduce]);

  return (
    <section
      id="wedge"
      ref={sectionRef}
      className="relative bg-ink text-cream py-28 md:py-40 px-6 md:px-10 overflow-hidden isolate"
    >
      {/* Subtle backdrop — stripped of perpetual drift */}
      <div className="absolute inset-0 pointer-events-none opacity-50" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 80% 30%, rgba(107,31,40,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(107,31,40,0.08) 0%, transparent 60%)",
          }}
        />
      </div>
      <div className="light-grain opacity-20" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">
        {/* Left: copy */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <Eyebrow tone="dark">Comment ça marche</Eyebrow>
          <h2 className="font-serif text-[48px] md:text-[72px] leading-[0.95] tracking-[-0.03em] text-cream">
            <BlurText text="Trouve qui décide." as="span" className="block" />
            <BlurText
              text="Écris juste."
              as="span"
              italic
              className="block text-cream/80"
            />
            <BlurText text="Arrive avant les autres." as="span" className="block" />
          </h2>
          <p className="font-sans text-[17px] md:text-[18px] leading-[1.7] text-cream/75 max-w-[44ch]">
            Tu donnes le nom de l&apos;entreprise et le poste visé. Cheatjob
            trouve l&apos;email du manager qui recrute, rédige un message
            personnalisé basé sur ton CV et le contexte de l&apos;offre, puis te
            propose d&apos;envoyer directement depuis ta boîte mail. Pas de
            boîte RH. Pas d&apos;ATS. Pas de file d&apos;attente.
          </p>
        </div>

        {/* Right: terminal dossier */}
        <div className="lg:col-span-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[8px] bg-[#0f0d0c] border border-cream/10 p-6 md:p-8 font-mono text-[13px] min-h-[380px]"
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-cream/10">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-cream/20" />
                <span className="size-2 rounded-full bg-cream/20" />
                <span className="size-2 rounded-full bg-cream/20" />
              </div>
              <div className="flex items-center gap-2 text-cream/40 text-[10px] font-sans uppercase tracking-[0.22em]">
                <Terminal className="size-3" strokeWidth={1.5} />
                cheatjob · cli
              </div>
            </div>

            <div className="space-y-3 text-cream/80">
              <div className="flex items-start gap-3">
                <span className="text-burgundy select-none">$</span>
                <span>
                  <span className="text-cream/50">entreprise:</span>{" "}
                  <span className="text-cream">Qonto</span>
                </span>
              </div>

              <motion.div
                initial={false}
                animate={{
                  opacity:
                    stage === "idle" || stage === "company" ? 0 : 1,
                  y: stage === "idle" || stage === "company" ? 8 : 0,
                }}
                transition={{ duration: 0.35 }}
                className="flex items-start gap-3"
              >
                <span className="text-burgundy select-none">$</span>
                <span className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2
                    className="size-3.5 text-cream shrink-0"
                    strokeWidth={2}
                  />
                  <span className="text-cream/60">email:</span>
                  <span className="text-cream">
                    thomas.dupuis@qonto.eu
                  </span>
                </span>
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  opacity:
                    stage === "idle" ||
                    stage === "company" ||
                    stage === "email"
                      ? 0
                      : 1,
                  y:
                    stage === "idle" ||
                    stage === "company" ||
                    stage === "email"
                      ? 8
                      : 0,
                }}
                transition={{ duration: 0.4 }}
                className="pt-5 mt-2 border-t border-cream/10"
              >
                <div className="flex items-center gap-2 text-cream/40 text-[10px] uppercase tracking-[0.22em] font-sans mb-3">
                  <Mail className="size-3" strokeWidth={1.5} />
                  Message rédigé
                </div>
                <p className="leading-[1.7] text-cream/90 font-serif italic text-[15px] min-h-[80px]">
                  {typed}
                  {stage === "message" &&
                    charIdx < MESSAGE_TEMPLATE.length && (
                      <span
                        className="caret-blink ml-0.5"
                        style={{ background: "currentColor" }}
                      />
                    )}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
