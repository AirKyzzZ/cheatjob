"use client";

import { forwardRef, useImperativeHandle, useState, useTransition, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { findEmail, saveManualEmail } from "@/server/actions/candidatures";
import { ManualEmailSchema } from "@/server/actions/candidatures.schemas";
import { track, EVENTS } from "@/lib/analytics/events";

export type StepEmailHandle = {
  submit: () => void;
};

type Props = {
  candidatureId: string;
  initialEmail: string | null;
  initialConfidence: string | null;
  quotaRemaining: number;
  onComplete: () => void;
};

type EmailState =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "found"; email: string; confidence: string }
  | { kind: "not_found" }
  | { kind: "unavailable" };

function confidenceKey(confidence: string): "confidenceHigh" | "confidenceMedium" | "confidenceLow" | "confidenceManual" {
  if (confidence === "high") return "confidenceHigh";
  if (confidence === "medium") return "confidenceMedium";
  if (confidence === "low") return "confidenceLow";
  return "confidenceManual";
}

function confidenceBadgeClass(confidence: string): string {
  if (confidence === "high") return "bg-emerald-100 text-emerald-800";
  if (confidence === "medium") return "bg-amber-100 text-amber-800";
  return "bg-muted text-muted-soft";
}

export const StepEmail = forwardRef<StepEmailHandle, Props>(
  function StepEmail(
    { candidatureId, initialEmail, initialConfidence, quotaRemaining, onComplete },
    ref,
  ) {
    const t = useTranslations("app.candidatures.wizard");
    const locale = useLocale();

    const [state, setState] = useState<EmailState>(() => {
      if (initialEmail) {
        return { kind: "found", email: initialEmail, confidence: initialConfidence ?? "manual" };
      }
      return { kind: "idle" };
    });

    const [manualEmail, setManualEmail] = useState("");
    const [manualError, setManualError] = useState<string | undefined>(undefined);
    const [savePending, startSaveTransition] = useTransition();
    const [findPending, startFindTransition] = useTransition();

    const quotaExhausted = quotaRemaining <= 0;

    useEffect(() => {
      if (quotaExhausted && state.kind !== "found") {
        track(EVENTS.QuotaExhausted);
      }
    }, [quotaExhausted, state.kind]);

    useImperativeHandle(ref, () => ({
      submit() {
        if (state.kind === "found") {
          onComplete();
        }
      },
    }));

    function handleFind() {
      if (quotaExhausted || findPending) return;
      track(EVENTS.EmailFinderAttempt);
      setState({ kind: "searching" });
      startFindTransition(async () => {
        const result = await findEmail(candidatureId);
        if (result.status === "found") {
          track(EVENTS.EmailFinderFound, { confidence: result.confidence });
          setState({ kind: "found", email: result.email, confidence: result.confidence });
        } else if (result.status === "not_found") {
          track(EVENTS.EmailFinderNotFound);
          setState({ kind: "not_found" });
        } else {
          track(EVENTS.EmailFinderNotFound);
          setState({ kind: "unavailable" });
        }
      });
    }

    function handleManualSave() {
      const parsed = ManualEmailSchema.safeParse({ email: manualEmail });
      if (!parsed.success) {
        setManualError(t("errorInvalidUrl"));
        return;
      }
      setManualError(undefined);
      startSaveTransition(async () => {
        await saveManualEmail(candidatureId, { email: manualEmail });
        setState({ kind: "found", email: manualEmail, confidence: "manual" });
      });
    }

    if (quotaExhausted && state.kind !== "found") {
      return (
        <div className="space-y-4">
          <p className="font-serif italic text-[15px] text-burgundy leading-snug">
            {t("quotaExhausted")}
          </p>
          <Link
            href={`/${locale}/dashboard/upgrade`}
            className="inline-block font-sans text-[14px] font-medium text-ink underline underline-offset-2"
          >
            {t("step3UpgradeLink")}
          </Link>
        </div>
      );
    }

    if (state.kind === "idle" || state.kind === "searching") {
      return (
        <div className="space-y-4">
          <p className="font-serif italic text-[15px] text-burgundy leading-snug">
            {t("step3Title")}
          </p>
          <button
            type="button"
            onClick={handleFind}
            disabled={state.kind === "searching" || findPending}
            className="h-11 px-6 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {state.kind === "searching" ? t("step3Searching") : t("findEmail")}
          </button>
        </div>
      );
    }

    if (state.kind === "found") {
      return (
        <div className="space-y-4">
          <p className="font-sans text-[13px] font-medium text-ink">{t("emailFound")}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-sans text-[15px] text-ink font-medium">{state.email}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-sans ${confidenceBadgeClass(state.confidence)}`}
            >
              {t(confidenceKey(state.confidence))}
            </span>
          </div>
        </div>
      );
    }

    const hint = state.kind === "unavailable" ? t("finderUnavailable") : t("emailNotFound");

    return (
      <div className="space-y-4">
        <p className="font-serif italic text-[15px] text-burgundy leading-snug">{hint}</p>
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("emailManualLabel")}
          </label>
          <Input
            type="email"
            value={manualEmail}
            onChange={(e) => {
              setManualEmail(e.target.value);
              setManualError(undefined);
            }}
            placeholder="thomas.dupont@acme.com"
            invalid={!!manualError}
            autoFocus
          />
          <FieldError message={manualError} />
        </div>
        <button
          type="button"
          onClick={handleManualSave}
          disabled={savePending || !manualEmail}
          className="h-11 px-6 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {savePending ? t("emailSaving") : t("emailSaveLabel")}
        </button>
      </div>
    );
  },
);
