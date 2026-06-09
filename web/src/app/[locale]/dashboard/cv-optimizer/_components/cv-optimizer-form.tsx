"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { track, EVENTS } from "@/lib/analytics/events";
import { analyzeCvFull } from "@/server/actions/cv-optimizer";
import type { CvAnalysis } from "@/server/integrations/ai/prompts/cv-optimizer";

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-muted-soft/60 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15 transition-colors";

export function CvOptimizerForm({
  locale,
  hasCv,
  quotaRemaining,
}: {
  locale: string;
  hasCv: boolean;
  quotaRemaining: number;
}) {
  const t = useTranslations("app.tools");
  const tt = useTranslations("tools");
  const [offerText, setOfferText] = useState("");
  const [pending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null);
  const [errorKind, setErrorKind] = useState<"quota" | "failed" | "invalid" | null>(null);
  const [creditsUsed, setCreditsUsed] = useState(0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorKind(null);
    startTransition(async () => {
      const res = await analyzeCvFull({ offerText });
      if (res.ok) {
        setAnalysis(res.analysis);
        setCreditsUsed((n) => n + 1);
        track(EVENTS.CvOptimized, {});
        return;
      }
      setAnalysis(null);
      if (res.error === "quota_exceeded") {
        setErrorKind("quota");
        track(EVENTS.QuotaExhausted, { source: "cv_optimizer" });
      } else if (res.error === "invalid_input") {
        setErrorKind("invalid");
      } else {
        setErrorKind("failed");
      }
    });
  }

  if (!hasCv) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-serif text-[32px] tracking-[-0.01em] text-ink">{t("cvTitle")}</h1>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-muted-soft">
          {t("cvNeedsCv")}
        </p>
        <Link
          href={`/${locale}/dashboard/profile`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-ink px-5 font-sans text-[14px] font-medium text-cream transition-opacity hover:opacity-90"
        >
          {t("cvNeedsCvCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-[32px] tracking-[-0.01em] text-ink">{t("cvTitle")}</h1>
      <p className="mt-2 font-sans text-[14px] text-muted-soft">
        {t("creditsRemaining", { count: Math.max(0, quotaRemaining - creditsUsed) })}
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        <div>
          <label htmlFor="offer" className="mb-2 block font-sans text-[13px] font-medium text-ink">
            {tt("fieldOfferContext")}
          </label>
          <textarea
            id="offer"
            required
            rows={7}
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-ink px-7 font-sans text-[15px] font-medium text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? tt("analyzing") : t("cvSubmit")}
          </button>
        </div>
      </form>

      {errorKind === "failed" && (
        <p className="mt-6 font-sans text-[14px] text-burgundy">{tt("errorFailed")}</p>
      )}
      {errorKind === "invalid" && (
        <p className="mt-6 font-sans text-[14px] text-burgundy">{tt("errorCvTooShort")}</p>
      )}
      {errorKind === "quota" && (
        <div className="mt-6 rounded-xl border border-burgundy/20 bg-burgundy/[0.04] p-5">
          <p className="font-sans text-[14px] leading-relaxed text-ink">{t("quotaExceeded")}</p>
          <Link
            href={`/${locale}/dashboard/upgrade`}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-burgundy px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-burgundy-deep"
          >
            {t("quotaCta")}
          </Link>
        </div>
      )}

      {analysis && (
        <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-serif text-[22px] leading-snug text-ink">{tt("cvResultTitle")}</p>
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
                  {tt(key)}
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
          {analysis.reecritures.length > 0 && (
            <div className="mt-6">
              <p className="font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-muted-soft">
                {t("cvReecritures")}
              </p>
              <div className="mt-3 grid gap-4">
                {analysis.reecritures.map((r, i) => (
                  <div key={i} className="rounded-xl border border-ink/10 p-4">
                    <p className="font-sans text-[14px] leading-relaxed text-muted-soft line-through">
                      {r.avant}
                    </p>
                    <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink">{r.apres}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
