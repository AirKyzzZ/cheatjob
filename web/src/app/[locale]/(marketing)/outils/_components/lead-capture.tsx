"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { track, EVENTS } from "@/lib/analytics/events";
import { captureToolLead } from "@/server/actions/tool-generator";

export function LeadCapture({ tool }: { tool: string }) {
  const t = useTranslations("tools");
  const [email, setEmail] = useState("");
  const [captureSent, setCaptureSent] = useState(false);
  const [capturePending, startCapture] = useTransition();

  function onCapture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startCapture(async () => {
      const res = await captureToolLead({ email });
      if (res.ok) {
        setCaptureSent(true);
        track(EVENTS.ToolEmailCaptured, { tool });
      }
    });
  }

  return (
    <div className="mt-6 rounded-2xl bg-ink p-7 text-cream">
      {captureSent ? (
        <p className="font-serif text-[20px] leading-snug">{t("captureDone")}</p>
      ) : (
        <form onSubmit={onCapture}>
          <p className="font-serif text-[20px] leading-snug">{t("captureTitle")}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("capturePlaceholder")}
              aria-label={t("captureTitle")}
              className="h-11 flex-1 rounded-xl border border-cream/20 bg-cream/[0.06] px-4 font-sans text-[15px] text-cream placeholder:text-cream/40 focus:border-cream/40 focus:outline-none focus:ring-2 focus:ring-cream/15 transition-colors"
            />
            <button
              type="submit"
              disabled={capturePending}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-cream px-6 font-sans text-[14px] font-medium text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {capturePending ? "…" : t("captureSubmit")}
            </button>
          </div>
          <p className="mt-3 font-sans text-[12px] leading-relaxed text-cream/55">
            {t("captureConsent")}
          </p>
        </form>
      )}
    </div>
  );
}
