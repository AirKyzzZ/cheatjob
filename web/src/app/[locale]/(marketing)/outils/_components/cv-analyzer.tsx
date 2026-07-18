"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { track, EVENTS } from "@/lib/analytics/events";
import { analyzeCvPublic } from "@/server/actions/cv-optimizer";
import type { CvAnalysis } from "@/server/integrations/ai/prompts/cv-optimizer";
import { LeadCapture } from "./lead-capture";

const TOOL = "cv_optimizer";

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-muted-soft/60 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15 transition-colors";

export function CvAnalyzer({ locale }: { locale: string }) {
  const t = useTranslations("tools");
  const [cvText, setCvText] = useState("");
  const [offerText, setOfferText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [pending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null);
  const [errorKind, setErrorKind] = useState<"rate_limited" | "failed" | "invalid" | null>(null);

  useEffect(() => {
    track(EVENTS.ToolViewed, { tool: TOOL });
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track(EVENTS.ToolGenerated, { tool: TOOL });
    setErrorKind(null);
    startTransition(async () => {
      const res = await analyzeCvPublic({ cvText, offerText, honeypot });
      if (res.ok) {
        setAnalysis(res.analysis);
        return;
      }
      setAnalysis(null);
      if (res.error === "rate_limited") {
        setErrorKind("rate_limited");
        track(EVENTS.ToolRateLimited, { tool: TOOL });
      } else if (res.error === "invalid_input") {
        setErrorKind("invalid");
      } else {
        setErrorKind("failed");
      }
    });
  }

  const signupHref = `/${locale}/sign-up?from=outils-${TOOL}`;

  return (
    <div className="mt-10">
      <form onSubmit={onSubmit} className="grid gap-5">
        <div>
          <label htmlFor="cv-text" className="mb-2 block font-sans text-[13px] font-medium text-ink">
            {t("fieldCvText")}
          </label>
          <textarea
            id="cv-text"
            required
            rows={8}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder={t("fieldCvTextPlaceholder")}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label htmlFor="offer-text" className="mb-2 block font-sans text-[13px] font-medium text-ink">
            {t("fieldOfferContext")}
          </label>
          <textarea
            id="offer-text"
            required
            rows={5}
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="absolute left-[-9999px] top-[-9999px] h-px w-px overflow-hidden" aria-hidden>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-ink px-7 font-sans text-[15px] font-medium text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? t("analyzing") : analysis ? t("reanalyze") : t("analyze")}
          </button>
        </div>
      </form>

      {errorKind === "failed" && (
        <p className="mt-6 font-sans text-[14px] text-burgundy">{t("errorFailed")}</p>
      )}
      {errorKind === "invalid" && (
        <p className="mt-6 font-sans text-[14px] text-burgundy">{t("errorCvTooShort")}</p>
      )}
      {errorKind === "rate_limited" && (
        <div className="mt-6 rounded-xl border border-burgundy/20 bg-burgundy/[0.04] p-5">
          <p className="font-sans text-[14px] leading-relaxed text-ink">{t("errorRateLimited")}</p>
          <a
            href={signupHref}
            onClick={() => track(EVENTS.ToolSignupClicked, { tool: TOOL })}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-burgundy px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-burgundy-deep"
          >
            {t("signupCta")}
          </a>
        </div>
      )}

      {analysis && (
        <div className="mt-10">
          <div className="rounded-2xl border border-ink/10 bg-white p-7">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-serif text-[22px] leading-snug text-ink">{t("cvResultTitle")}</p>
              <p className="font-serif text-[40px] leading-none text-burgundy">
                {analysis.score}
                <span className="font-sans text-[14px] text-muted-soft">/100</span>
              </p>
            </div>
            {(
              [
                ["cvForces", analysis.forces],
                ["cvLacunes", analysis.lacunes],
                ["cvMotsCles", analysis.mots_cles],
                ["cvConseils", analysis.conseils],
              ] as const
            ).map(([key, items]) =>
              items.length ? (
                <div key={key} className="mt-6">
                  <p className="font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-muted-soft">
                    {t(key)}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {items.map((item) => (
                      <li key={item} className="font-sans text-[15px] leading-relaxed text-ink">
                        — {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
          <LeadCapture tool={TOOL} />
        </div>
      )}
    </div>
  );
}
