"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { track, EVENTS } from "@/lib/analytics/events";
import { writeLettre } from "@/server/actions/lettre-writer";

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-muted-soft/60 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15 transition-colors";

export function LettreForm({
  locale,
  quotaRemaining,
}: {
  locale: string;
  quotaRemaining: number;
}) {
  const t = useTranslations("app.tools");
  const tt = useTranslations("tools");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [offerContext, setOfferContext] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [errorKind, setErrorKind] = useState<"quota" | "failed" | "invalid" | null>(null);
  const [copied, setCopied] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);

  useEffect(() => {
    track(EVENTS.ToolViewed, { tool: "lettre_dashboard" });
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorKind(null);
    startTransition(async () => {
      const res = await writeLettre({
        targetRole,
        targetCompany,
        recruiterName: recruiterName || undefined,
        offerContext,
      });
      if (res.ok) {
        setResult({ subject: res.subject, body: res.body });
        setCreditsUsed((n) => n + 1);
        track(EVENTS.LettreGenerated, {});
        return;
      }
      setResult(null);
      if (res.error === "quota_exceeded") {
        setErrorKind("quota");
        track(EVENTS.QuotaExhausted, { source: "lettre" });
      } else if (res.error === "invalid_input") {
        setErrorKind("invalid");
      } else {
        setErrorKind("failed");
      }
    });
  }

  async function onCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(`${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-[32px] tracking-[-0.01em] text-ink">{t("lettreTitle")}</h1>
      <p className="mt-2 font-sans text-[14px] text-muted-soft">
        {t("creditsRemaining", { count: Math.max(0, quotaRemaining - creditsUsed) })}
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        <div>
          <label htmlFor="role" className="mb-2 block font-sans text-[13px] font-medium text-ink">
            {tt("fieldTargetRole")}
          </label>
          <input id="role" type="text" required value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="company" className="mb-2 block font-sans text-[13px] font-medium text-ink">
            {tt("fieldTargetCompany")}
          </label>
          <input id="company" type="text" required value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="recruiter" className="mb-2 block font-sans text-[13px] font-medium text-ink">
            {tt("fieldRecruiterName")}
            <span className="ml-2 font-normal text-muted-soft">({t("optional")})</span>
          </label>
          <input id="recruiter" type="text" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="offer" className="mb-2 block font-sans text-[13px] font-medium text-ink">
            {tt("fieldOfferContext")}
          </label>
          <textarea id="offer" required rows={6} value={offerContext} onChange={(e) => setOfferContext(e.target.value)} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-ink px-7 font-sans text-[15px] font-medium text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? tt("generating") : result ? tt("regenerate") : t("lettreSubmit")}
          </button>
        </div>
      </form>

      {errorKind === "failed" && (
        <p className="mt-6 font-sans text-[14px] text-burgundy">{tt("errorFailed")}</p>
      )}
      {errorKind === "invalid" && (
        <p className="mt-6 font-sans text-[14px] text-burgundy">{t("lettreInvalid")}</p>
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

      {result && (
        <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-7">
          <div className="flex items-start justify-between gap-4">
            <p className="font-serif text-[22px] leading-snug text-ink">{tt("resultTitle")}</p>
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 rounded-lg border border-ink/15 px-4 py-2 font-sans text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.04]"
            >
              {copied ? tt("copied") : tt("copy")}
            </button>
          </div>
          <p className="mt-5 font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-muted-soft">
            {result.subject}
          </p>
          <div className="mt-3 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-ink">
            {result.body}
          </div>
        </div>
      )}
    </div>
  );
}
