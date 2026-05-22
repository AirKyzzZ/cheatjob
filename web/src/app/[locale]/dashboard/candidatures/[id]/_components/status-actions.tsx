"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setCandidatureStatus } from "@/server/actions/candidatures";

type ClosedReason = "won" | "rejected" | "gave_up" | "other";

type Props = {
  candidatureId: string;
  status: string;
};

export function StatusActions({ candidatureId, status }: Props) {
  const t = useTranslations("app.candidatures.detail");
  const router = useRouter();

  const [showCloseDropdown, setShowCloseDropdown] = useState(false);
  const [closedReason, setClosedReason] = useState<ClosedReason>("other");
  const [pending, startTransition] = useTransition();

  if (status === "replied") {
    return (
      <div className="rounded-xl border border-ink/10 bg-white px-4 py-3">
        <p className="font-serif italic text-[14px] text-ink">{t("stateReplied")}</p>
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div className="rounded-xl border border-ink/10 bg-white px-4 py-3">
        <p className="font-serif italic text-[14px] text-muted">{t("stateClosed")}</p>
      </div>
    );
  }

  if (status !== "sent") return null;

  function handleMarkReplied() {
    startTransition(async () => {
      await setCandidatureStatus({ id: candidatureId, status: "replied" });
      router.refresh();
    });
  }

  function handleClose() {
    startTransition(async () => {
      await setCandidatureStatus({
        id: candidatureId,
        status: "closed",
        closedReason,
      });
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 space-y-5">
      <p className="font-sans text-[11px] uppercase tracking-[0.22em] font-medium text-muted-soft">
        {t("statusActionsLabel")}
      </p>

      <div className="flex items-start gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleMarkReplied}
          disabled={pending}
          className="h-10 px-5 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {t("markReplied")}
        </button>

        {!showCloseDropdown ? (
          <button
            type="button"
            onClick={() => setShowCloseDropdown(true)}
            disabled={pending}
            className="h-10 px-5 rounded-xl border border-ink/15 bg-white font-sans text-[14px] font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {t("close")}
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={closedReason}
              onChange={(e) => setClosedReason(e.target.value as ClosedReason)}
              className="h-10 px-3 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
            >
              <option value="won">{t("reasonWon")}</option>
              <option value="rejected">{t("reasonRejected")}</option>
              <option value="gave_up">{t("reasonGaveUp")}</option>
              <option value="other">{t("reasonOther")}</option>
            </select>
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="h-10 px-5 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {t("confirmClose")}
            </button>
            <button
              type="button"
              onClick={() => setShowCloseDropdown(false)}
              className="h-10 px-3 rounded-xl border border-ink/15 bg-white font-sans text-[14px] font-medium text-muted transition-opacity hover:opacity-70"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
