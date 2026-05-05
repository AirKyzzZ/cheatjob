"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { X, Mail, Loader2, Check } from "lucide-react";
import { EVENTS, identify, setPersonProps, track } from "@/lib/analytics/events";
import { joinWaitlist } from "@/server/actions/waitlist";
import type { Locale } from "@/types/locale";

type Props = {
  open: boolean;
  onClose: () => void;
  plan?: string;
  source?: string;
};

export function WaitlistModal({ open, onClose, plan, source }: Props) {
  const t = useTranslations("waitlist");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const emailId = useId();
  const intentId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setState("idle");
      setErrorMsg(null);
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const intent = String(data.get("intent") ?? "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(t("errorInvalidEmail"));
      setState("error");
      track(EVENTS.WaitlistError, { reason: "invalid_email" });
      return;
    }

    setState("submitting");
    setErrorMsg(null);

    try {
      // Persist via Server Action only when Supabase env is wired in prod.
      // In local dev without Supabase keys this throws, so swallow that
      // case to keep the analytics path intact.
      try {
        await joinWaitlist({
          email,
          plan: plan as "sprint" | "mois" | "vie" | undefined,
          source,
          intent,
          locale,
        });
      } catch (persistErr) {
        track(EVENTS.WaitlistError, {
          reason: "persist_failed",
          message: persistErr instanceof Error ? persistErr.message : "unknown",
        });
      }

      identify(email, {
        email,
        waitlist_plan: plan,
        waitlist_source: source,
        waitlist_intent: intent,
        waitlist_locale: locale,
        waitlist_joined_at: new Date().toISOString(),
      });
      setPersonProps({ email });
      track(EVENTS.WaitlistSubmitted, {
        plan,
        source,
        intent,
        locale,
      });
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMsg(t("errorSubmit"));
      track(EVENTS.WaitlistError, {
        reason: "submit_failed",
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  const planLabel = plan ? t(`planLabels.${plan}` as "planLabels.sprint") : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="waitlist-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={reduce ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label={t("closeAria")}
            onClick={onClose}
            className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[520px] bg-cream rounded-[14px] shadow-[0_24px_64px_rgba(10,10,10,0.28)] p-8 md:p-10"
          >
            <button
              type="button"
              aria-label={t("closeAria")}
              onClick={onClose}
              className="absolute top-4 right-4 size-9 rounded-full flex items-center justify-center text-muted hover:bg-ink/5 transition-colors"
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>

            {state === "done" ? (
              <div className="flex flex-col gap-5 pt-2">
                <div className="size-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <Check className="size-5 text-burgundy" strokeWidth={2.2} />
                </div>
                <h2
                  id="waitlist-title"
                  className="font-serif text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.02em] text-ink"
                >
                  {t("doneHeadlineLead")}{" "}
                  <span className="italic">{t("doneHeadlineItalic")}</span>
                </h2>
                <p className="font-sans text-[15px] leading-[1.6] text-muted">
                  {t("doneBody")}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 h-12 rounded-[10px] bg-ink text-cream text-[14px] font-semibold font-sans hover:-translate-y-0.5 transition-transform"
                >
                  {t("doneBack")}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-px w-8 bg-burgundy" aria-hidden />
                  <span className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted">
                    {t("preOrderEyebrow")}
                  </span>
                </div>
                <h2
                  id="waitlist-title"
                  className="font-serif text-[30px] md:text-[38px] leading-[1.05] tracking-[-0.02em] text-ink mb-3"
                >
                  {t("headlineDefault")}
                </h2>
                <p className="font-sans text-[14.5px] leading-[1.6] text-muted mb-7">
                  {planLabel ? (
                    <>
                      {t("bodyWithPlanLead")}{" "}
                      <span className="text-ink font-medium">{planLabel}</span>
                      {t("bodyWithPlanTrail")}
                    </>
                  ) : (
                    t("bodyDefault")
                  )}
                </p>

                <form
                  ref={formRef}
                  onSubmit={onSubmit}
                  className="flex flex-col gap-4"
                  noValidate
                >
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={emailId}
                      className="font-sans text-[12px] uppercase tracking-[0.18em] text-muted font-medium"
                    >
                      {t("emailLabel")}
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted"
                        strokeWidth={1.6}
                        aria-hidden
                      />
                      <input
                        id={emailId}
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder={t("emailPlaceholder")}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-border-subtle rounded-[10px] font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-burgundy transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={intentId}
                      className="font-sans text-[12px] uppercase tracking-[0.18em] text-muted font-medium"
                    >
                      {t("intentLabel")}
                    </label>
                    <select
                      id={intentId}
                      name="intent"
                      defaultValue=""
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-[10px] font-sans text-[14px] text-ink focus:outline-none focus:border-burgundy transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        {t("intentDefault")}
                      </option>
                      <option value="stage">{t("intentStage")}</option>
                      <option value="alternance">{t("intentAlternance")}</option>
                      <option value="cdi">{t("intentCdi")}</option>
                      <option value="other">{t("intentOther")}</option>
                    </select>
                  </div>

                  {errorMsg && (
                    <p
                      role="alert"
                      className="font-sans text-[13px] text-burgundy"
                    >
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="mt-2 h-12 rounded-[10px] bg-burgundy text-cream text-[14px] font-semibold font-sans hover:bg-burgundy-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        {t("submitting")}
                      </>
                    ) : (
                      t("submit")
                    )}
                  </button>

                  <p className="font-sans italic text-[12px] text-muted-soft text-center leading-[1.5]">
                    {t("microcopy")}
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
