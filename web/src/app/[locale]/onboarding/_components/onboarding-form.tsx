"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { FieldError } from "@/components/ui/field-error";
import { completeOnboarding } from "@/server/actions/onboarding";
import { track, EVENTS } from "@/lib/analytics/events";

function isRedirect(e: unknown): boolean {
  return (
    e instanceof Error &&
    "digest" in e &&
    String((e as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

const STUDY_LEVELS = ["L3", "M1", "M2", "BTS2", "DUT2", "Autre"] as const;
const LOCALES = ["fr", "en", "es", "de"] as const;

export function OnboardingForm({
  locale,
  initialFullName,
}: {
  locale: string;
  initialFullName: string;
}) {
  const t = useTranslations("onboarding");
  const tErrors = useTranslations("auth.errors");
  const [fullName, setFullName] = useState(initialFullName);
  const [school, setSchool] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [chosenLocale, setChosenLocale] = useState(locale);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    track(EVENTS.OnboardingStarted);
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            track(EVENTS.OnboardingSubmitted);
            await completeOnboarding({
              fullName,
              school,
              studyLevel,
              locale: chosenLocale,
            });
          } catch (err) {
            if (isRedirect(err)) throw err;
            setError(err instanceof Error ? err.message : tErrors("generic"));
          }
        });
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
          {t("fullNameLabel")}
        </label>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          minLength={2}
          autoComplete="name"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
          {t("schoolLabel")}
        </label>
        <Input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
          {t("studyLevelLabel")}
        </label>
        <RadioGroup
          name="studyLevel"
          value={studyLevel}
          onChange={setStudyLevel}
          options={STUDY_LEVELS.map((v) => ({ value: v, label: v }))}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
          {t("localeLabel")}
        </label>
        <RadioGroup
          name="locale"
          value={chosenLocale}
          onChange={setChosenLocale}
          options={LOCALES.map((v) => ({ value: v, label: v.toUpperCase() }))}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        loading={pending}
        disabled={!studyLevel}
      >
        {t("submit")}
      </Button>
      <FieldError message={error ?? undefined} />
    </form>
  );
}
