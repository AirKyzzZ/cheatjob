"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { saveDraftEdit } from "@/server/actions/candidatures";
import { generateMessage } from "@/server/actions/drafter";

type Props = {
  candidatureId: string;
  initialSubject: string;
  initialBody: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";
type RegenState = "idle" | "generating" | "error";

export function DraftEditor({ candidatureId, initialSubject, initialBody }: Props) {
  const t = useTranslations("app.candidatures.detail");
  const tw = useTranslations("app.candidatures.wizard");

  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [regenState, setRegenState] = useState<RegenState>("idle");
  const [savePending, startSaveTransition] = useTransition();
  const [regenPending, startRegenTransition] = useTransition();

  const isDirty = subject !== initialSubject || body !== initialBody;

  function handleSave() {
    if (!isDirty) return;
    setSaveState("saving");
    startSaveTransition(async () => {
      try {
        await saveDraftEdit({ candidatureId, subject, body });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2500);
      } catch {
        setSaveState("error");
      }
    });
  }

  function handleRegen() {
    setRegenState("generating");
    startRegenTransition(async () => {
      const result = await generateMessage(candidatureId);
      if (result.ok) {
        setSubject(result.subject);
        setBody(result.body);
        setRegenState("idle");
        setSaveState("idle");
      } else {
        setRegenState("error");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 space-y-5">
      <p className="font-sans text-[11px] uppercase tracking-[0.22em] font-medium text-muted-soft">
        {t("draftLabel")}
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium text-muted font-sans mb-1.5">
            {t("subjectLabel")}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setSaveState("idle");
            }}
            disabled={regenPending}
            className="w-full h-10 px-3 rounded-lg border border-ink/15 bg-cream font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-muted font-sans mb-1.5">
            {t("bodyLabel")}
          </label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSaveState("idle");
            }}
            disabled={regenPending}
            rows={10}
            className="w-full px-3 py-2.5 rounded-lg border border-ink/15 bg-cream font-serif text-[14px] text-ink leading-relaxed resize-y placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || savePending || regenPending}
          className="h-10 px-5 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {savePending ? t("saving") : t("save")}
        </button>

        <button
          type="button"
          onClick={handleRegen}
          disabled={regenPending || savePending}
          className="h-10 px-5 rounded-xl border border-ink/15 bg-white font-sans text-[14px] font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {regenPending ? tw("generating") : tw("regenerate")}
        </button>

        {saveState === "saved" && (
          <span className="font-serif italic text-[13px] text-emerald-700">{t("savedConfirmation")}</span>
        )}
        {saveState === "error" && (
          <span className="font-serif italic text-[13px] text-burgundy">{t("saveError")}</span>
        )}
        {regenState === "error" && (
          <span className="font-serif italic text-[13px] text-burgundy">{tw("generationFailed")}</span>
        )}
      </div>
    </div>
  );
}
