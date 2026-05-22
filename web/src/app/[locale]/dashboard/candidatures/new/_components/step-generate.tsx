"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { generateMessage } from "@/server/actions/drafter";

type GenerateState =
  | { kind: "initial" }
  | { kind: "generating" }
  | { kind: "done"; subject: string; body: string }
  | { kind: "failed" };

type Props = {
  candidatureId: string;
  locale: string;
};

export function StepGenerate({ candidatureId, locale }: Props) {
  const t = useTranslations("app.candidatures.wizard");
  const router = useRouter();
  const [state, setState] = useState<GenerateState>({ kind: "initial" });
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setState({ kind: "generating" });
    startTransition(async () => {
      const result = await generateMessage(candidatureId);
      if (result.ok) {
        setState({ kind: "done", subject: result.subject, body: result.body });
      } else {
        setState({ kind: "failed" });
      }
    });
  }

  if (state.kind === "initial") {
    return (
      <div className="space-y-6">
        <p className="font-serif italic text-[15px] text-burgundy leading-snug">
          {t("step5Title")}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          className="h-11 px-6 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium transition-opacity"
        >
          {t("generate")}
        </button>
      </div>
    );
  }

  if (state.kind === "generating") {
    return (
      <div className="flex items-center gap-3 py-4">
        <span className="inline-block h-4 w-4 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />
        <span className="font-sans text-[14px] text-ink">{t("generating")}</span>
      </div>
    );
  }

  if (state.kind === "failed") {
    return (
      <div className="space-y-4">
        <p className="font-serif italic text-[15px] text-burgundy leading-snug">
          {t("generationFailed")}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="h-11 px-6 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {t("regenerate")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink/10 bg-white p-6 space-y-4">
        <p className="font-sans text-[12px] font-medium text-muted-soft uppercase tracking-wide">
          {state.subject}
        </p>
        <p className="font-serif text-[15px] text-ink leading-relaxed whitespace-pre-wrap">
          {state.body}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="h-11 px-6 rounded-xl border border-ink/15 bg-white font-sans text-[14px] font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {pending ? t("generating") : t("regenerate")}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/candidatures/${candidatureId}`)}
          className="h-11 px-6 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium transition-opacity"
        >
          {t("viewCandidature")}
        </button>
      </div>
    </div>
  );
}
