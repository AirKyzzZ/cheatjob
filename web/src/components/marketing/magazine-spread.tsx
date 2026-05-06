"use client";

import { useTranslations } from "next-intl";

/**
 * Editorial transcription of a real recruiter reply, set as a magazine spread.
 * Lives in the hero right column, replacing the previous floating ProofPanel.
 *
 * Brand charter §6: no illustrations, no shadows, photography or typography
 * only. This component IS the proof — typography stands in for a screenshot.
 * Anonymize the sender (initial only). Companies stay by name (charter §10:
 * "sociétés conservées par transparence").
 */
export function MagazineSpread() {
  const t = useTranslations("hero.magazineSpread");

  return (
    <article
      role="figure"
      aria-label={t("ariaLabel")}
      className="
        relative w-full max-w-[460px]
        bg-cream text-ink
        rounded-[16px] border border-[#E8E6E1]
        p-8 md:p-10
      "
    >
      {/* Eyebrow */}
      <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#9A9A9A] mb-7">
        {t("metaLabel")}
      </p>

      {/* Sender */}
      <header className="flex flex-col gap-1 mb-7">
        <p className="font-serif text-[22px] leading-tight tracking-[-0.01em]">
          {t("senderName")}
        </p>
        <p className="font-sans text-[12px] tracking-[0.04em] text-[#6B6B6B]">
          {t("senderRole")}
          <span className="text-[#CFCBC2]"> · </span>
          {t("senderCompany")}
        </p>
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-burgundy mt-2">
          {t("date")}
        </p>
      </header>

      {/* Subject — the one accent-italic moment per screen */}
      <h3 className="font-serif italic text-[24px] md:text-[26px] leading-[1.2] tracking-[-0.01em] mb-6 text-ink">
        {t("subject")}
      </h3>

      {/* Body opening */}
      <p className="font-sans text-[15px] leading-[1.65] text-ink/85 mb-7">
        {t("bodyOpening")}
      </p>

      {/* Pull quote */}
      <blockquote className="border-t border-[#E8E6E1] pt-6">
        <p className="font-serif text-[26px] md:text-[30px] leading-[1.2] tracking-[-0.01em] text-burgundy">
          &ldquo;{t("pullQuote")}&rdquo;
        </p>
      </blockquote>

      {/* Caption */}
      <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#9A9A9A] mt-7">
        {t("caption")}
      </p>
    </article>
  );
}
