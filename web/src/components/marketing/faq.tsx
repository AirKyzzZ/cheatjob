"use client";

import { motion, AnimatePresence } from "motion/react";
import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import { EVENTS, track } from "@/lib/analytics/events";
import { useSectionViewed } from "@/hooks/use-section-viewed";

const FAQ_KEYS = ["legal", "robot", "early", "contracts", "sender", "bts"] as const;

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const buttonId = useId();
  return (
    <div className="border-b border-border-subtle" role="group">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-6 py-6 text-left"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="font-sans font-medium text-[17px] md:text-[18px] text-ink">
          {q}
        </span>
        <Plus
          className={cn(
            "size-5 text-muted shrink-0 transition-transform duration-300",
            open && "rotate-45 text-burgundy"
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-10 font-sans text-[15px] md:text-[16px] leading-[1.65] text-muted">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const t = useTranslations("faq");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  useSectionViewed("faq", sectionRef);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="bg-cream py-24 md:py-32 px-6 md:px-10"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[820px] flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-6">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] text-ink max-w-[22ch]">
            {t("headline")}
          </h2>
        </div>

        <div className="border-t border-border-subtle">
          {FAQ_KEYS.map((key, i) => {
            const q = t(`items.${key}.q`);
            const a = t(`items.${key}.a`);
            return (
              <FaqItem
                key={key}
                q={q}
                a={a}
                open={openIdx === i}
                onToggle={() => {
                  const willOpen = openIdx !== i;
                  setOpenIdx(willOpen ? i : null);
                  if (willOpen) {
                    track(EVENTS.FaqExpanded, { index: i, question: q });
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
