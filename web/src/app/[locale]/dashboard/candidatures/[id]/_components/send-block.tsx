"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { markSent } from "@/server/actions/candidatures";
import { track, EVENTS } from "@/lib/analytics/events";

type Props = {
  candidatureId: string;
  email: string;
  subject: string;
  body: string;
};

export function SendBlock({ candidatureId, email, subject, body }: Props) {
  const t = useTranslations("app.candidatures.detail");
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [markPending, startMarkTransition] = useTransition();

  function handleOpenGmail() {
    const url =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(email)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowConfirm(true);
  }

  function handleCopy() {
    navigator.clipboard.writeText(`${subject}\n\n${body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShowConfirm(true);
  }

  function handleMarkSent() {
    startMarkTransition(async () => {
      await markSent(candidatureId);
      track(EVENTS.CandidatureSent);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 space-y-5">
      <p className="font-sans text-[11px] uppercase tracking-[0.22em] font-medium text-muted-soft">
        {t("sendLabel")}
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleOpenGmail}
          className="h-10 px-5 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium transition-opacity hover:opacity-80"
        >
          {t("openInGmail")}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="h-10 px-5 rounded-xl border border-ink/15 bg-white font-sans text-[14px] font-medium text-ink transition-opacity hover:opacity-70"
        >
          {copied ? t("copied") : t("copyEmail")}
        </button>
      </div>

      {showConfirm && (
        <div className="space-y-3 pt-1 border-t border-ink/8">
          <p className="font-serif italic text-[15px] text-ink leading-snug">
            {t("sentConfirmPrompt")}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMarkSent}
              disabled={markPending}
              className="h-10 px-5 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {t("sentYes")}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="h-10 px-5 rounded-xl border border-ink/15 bg-white font-sans text-[14px] font-medium text-ink transition-opacity hover:opacity-70"
            >
              {t("sentNo")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
